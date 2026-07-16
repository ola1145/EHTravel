// Persistent floating multimodal assistant. Mounted once outside the booking stage container.
const FloatingTravelAssistant = () => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([{
    id: "welcome", role: "assistant",
    text: "Hi — I can help with travel questions, analyze a document or image, and securely check your flight orders after you sign in."
  }]);
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [recording, setRecording] = useState(null); // audio | video
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const launcherRef = useRef(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const transcriptRef = useRef(null);
  const previewRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingModeRef = useRef(null);
  const sendAbortRef = useRef(null);
  const attachmentsRef = useRef([]);

  useEffect(() => { attachmentsRef.current = attachments; }, [attachments]);

  useEffect(() => {
    if (recording !== "video" || !previewRef.current || !streamRef.current) return;
    previewRef.current.srcObject = streamRef.current;
    previewRef.current.play().catch(() => {
      setError("The camera started, but its preview could not be displayed. You can stop and attach the recording or cancel it.");
    });
  }, [recording]);

  const stopTracks = useCallback(() => {
    if (previewRef.current) previewRef.current.srcObject = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recorderRef.current = null;
    recordingModeRef.current = null;
    chunksRef.current = [];
    setRecording(null);
    setRecordingSeconds(0);
  }, []);

  useEffect(() => () => {
    sendAbortRef.current?.abort();
    try { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); } catch {}
    stopTracks();
    attachmentsRef.current.forEach(item => item.url && URL.revokeObjectURL(item.url));
  }, [stopTracks]);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && open) {
        if (recording) cancelRecording();
        setOpen(false);
        setTimeout(() => launcherRef.current?.focus(), 0);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, recording]);

  function attachmentKind(file) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  }

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const currentAttachments = attachmentsRef.current;
    const room = Math.max(0, 5 - currentAttachments.length);
    const selected = incoming.slice(0, room);
    const tooLarge = selected.find(file => file.size > 10 * 1024 * 1024);
    const total = [...currentAttachments.map(item => item.file), ...selected].reduce((sum, file) => sum + file.size, 0);
    if (incoming.length > room) setError("You can attach up to five files per message.");
    else if (tooLarge) setError(`${tooLarge.name} is larger than 10 MiB.`);
    else if (total > 25 * 1024 * 1024) setError("Combined attachments cannot exceed 25 MiB.");
    else {
      setError("");
      setAttachments(current => [...current, ...selected.map(file => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
        file,
        kind: attachmentKind(file),
        url: URL.createObjectURL(file),
      }))]);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeAttachment(id) {
    setAttachments(current => current.filter(item => {
      if (item.id === id && item.url) URL.revokeObjectURL(item.url);
      return item.id !== id;
    }));
  }

  function preferredMime(mode) {
    const candidates = mode === "video"
      ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/mp4", "video/webm"]
      : ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"];
    return candidates.find(type => MediaRecorder.isTypeSupported?.(type)) || "";
  }

  function extensionFor(type, mode) {
    if (type.includes("mp4")) return mode === "video" ? "mp4" : "m4a";
    if (type.includes("ogg")) return "ogg";
    return "webm";
  }

  function captureVideoFrame() {
    const video = previewRef.current;
    if (!video?.videoWidth || !video?.videoHeight) return Promise.resolve(null);
    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob ? new File([blob], `video-frame-${Date.now()}.png`, { type: "image/png" }) : null), "image/png", .9));
  }

  async function startRecording(mode) {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(`${mode === "video" ? "Camera" : "Voice"} recording is not supported here. You can attach a prerecorded file instead.`);
      return;
    }
    if (!window.isSecureContext) {
      setError("Camera and microphone recording require HTTPS (localhost is allowed for development).");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mode === "video" ? { video: { facingMode: "user" }, audio: true } : { audio: true });
      streamRef.current = stream;
      recordingModeRef.current = mode;
      const mimeType = preferredMime(mode);
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        ...(mode === "video" ? { videoBitsPerSecond: 700000, audioBitsPerSecond: 64000 } : { audioBitsPerSecond: 64000 }),
      });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = event => { if (event.data?.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => { setError("Recording failed. Please try a file upload instead."); stopTracks(); };
      recorder.start(500);
      setRecording(mode);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(seconds => {
          if (seconds >= 59) setTimeout(() => finishRecording(), 0);
          return seconds + 1;
        });
      }, 1000);
    } catch (reason) {
      stopTracks();
      setError(reason?.name === "NotAllowedError" ? "Camera or microphone permission was denied. Text and file upload are still available." : "This camera or microphone could not be started.");
    }
  }

  async function finishRecording() {
    const recorder = recorderRef.current;
    const mode = recordingModeRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (!recorder || recorder.state === "inactive") { stopTracks(); return; }
    const frame = mode === "video" ? await captureVideoFrame() : null;
    recorder.onstop = () => {
      const type = recorder.mimeType || preferredMime(mode) || (mode === "video" ? "video/webm" : "audio/webm");
      const blob = new Blob(chunksRef.current, { type });
      stopTracks();
      if (!blob.size) {
        setError("No media was captured. Please record again or attach a prerecorded file.");
        return;
      }
      const media = new File([blob], `${mode}-message-${Date.now()}.${extensionFor(type, mode)}`, { type });
      addFiles(frame ? [media, frame] : [media]);
    };
    recorder.stop();
  }

  function cancelRecording() {
    const recorder = recorderRef.current;
    if (recorder) recorder.onstop = () => stopTracks();
    try { if (recorder?.state === "recording") recorder.stop(); else stopTracks(); } catch { stopTracks(); }
  }

  async function sendMessage() {
    const text = draft.trim();
    if ((!text && !attachments.length) || sending) return;
    setError("");
    const localAttachments = [...attachments];
    const localId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const history = messages.filter(message => message.id !== "welcome" && message.status !== "error")
      .slice(-10).map(message => ({ role: message.role === "assistant" ? "ASSISTANT" : "USER", text: message.text }));
    setMessages(current => [...current, { id: localId, role: "user", text: text || "Sent attachments", attachments: localAttachments.map(item => ({ name: item.file.name, kind: item.kind })), status: "sending" }]);
    setSending(true);
    const controller = new AbortController();
    sendAbortRef.current = controller;
    try {
      const uploaded = localAttachments.length
        ? await window.EHT_API.uploadAssistantAttachments(localAttachments.map(item => item.file), { signal: controller.signal })
        : [];
      const reply = await window.EHT_API.sendAssistantMessage({
        conversationId,
        message: text,
        history,
        attachmentIds: uploaded.map(item => item.id),
        bookingReference: null,
      });
      setConversationId(reply.conversationId);
      setMessages(current => [
        ...current.map(message => message.id === localId ? { ...message, status: "sent" } : message),
        { id: `${localId}_reply`, role: "assistant", text: reply.message, orders: reply.orders || [] }
      ]);
      setDraft("");
      localAttachments.forEach(item => item.url && URL.revokeObjectURL(item.url));
      setAttachments([]);
    } catch (reason) {
      if (reason?.name !== "AbortError") {
        setError(reason?.message || "The assistant could not send this message.");
        setMessages(current => current.map(message => message.id === localId ? { ...message, status: "error" } : message));
      }
    } finally {
      setSending(false);
      sendAbortRef.current = null;
    }
  }

  function closePanel() {
    if (recording) cancelRecording();
    setOpen(false);
    setTimeout(() => launcherRef.current?.focus(), 0);
  }

  function formatTimer(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
  function formatBytes(size) { return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`; }

  return (
    <div className="eht-assistant-root">
      {open && (
        <section id="eht-travel-assistant" className="eht-assistant-panel" role="dialog" aria-modal="false" aria-labelledby="eht-assistant-title" aria-busy={sending}>
          <header className="eht-assistant-header">
            <div className="eht-assistant-avatar" aria-hidden="true"><Icon.plane size={17}/></div>
            <div>
              <div id="eht-assistant-title" className="eht-assistant-title serif">Travel assistant</div>
              <div className="eht-assistant-subtitle"><span className="eht-live-dot"/> Secure multimodal help</div>
            </div>
            <button className="eht-icon-button" onClick={closePanel} aria-label="Minimize travel assistant">×</button>
          </header>

          <div ref={transcriptRef} className="eht-assistant-transcript" role="log" aria-live="polite" aria-relevant="additions text">
            {messages.map(message => (
              <article key={message.id} className={`eht-message eht-message-${message.role}`}>
                <div className="eht-message-label mono">{message.role === "assistant" ? "EHTravel" : "You"}</div>
                <div className="eht-message-bubble">{message.text}</div>
                {!!message.attachments?.length && <div className="eht-message-files">{message.attachments.map(file => <span key={file.name}>↗ {file.name}</span>)}</div>}
                {!!message.orders?.length && <div className="eht-order-source">✓ Verified from {message.orders.length} owned flight order{message.orders.length === 1 ? "" : "s"}</div>}
                {message.status === "sending" && <div className="eht-message-status">Sending securely…</div>}
                {message.status === "error" && <div className="eht-message-status eht-status-error">Not sent — edit or retry below</div>}
              </article>
            ))}
            {sending && <div className="eht-thinking" aria-label="Assistant is thinking"><span/><span/><span/></div>}
          </div>

          {recording && (
            <div className="eht-recording" role="status">
              {recording === "video" && <video ref={previewRef} className="eht-video-preview" muted playsInline aria-label="Live camera preview" />}
              <div className="eht-recording-row">
                <span className="eht-recording-dot" aria-hidden="true"/>
                <strong>{recording === "video" ? "Recording video" : "Recording voice"}</strong>
                <span className="mono">{formatTimer(recordingSeconds)} / 01:00</span>
                <button onClick={finishRecording} className="eht-record-stop">Stop & attach</button>
                <button onClick={cancelRecording} className="eht-record-cancel" aria-label="Cancel recording">×</button>
              </div>
            </div>
          )}

          {!!attachments.length && (
            <div className="eht-attachments" aria-label="Attachments ready to send">
              {attachments.map(item => (
                <div key={item.id} className="eht-attachment">
                  {item.kind === "image" ? <img src={item.url} alt=""/> : <span className="eht-file-kind" aria-hidden="true">{item.kind === "audio" ? "♪" : item.kind === "video" ? "▶" : "DOC"}</span>}
                  <span className="eht-file-name"><strong>{item.file.name}</strong><small>{formatBytes(item.file.size)}</small></span>
                  <button onClick={() => removeAttachment(item.id)} aria-label={`Remove ${item.file.name}`}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="eht-assistant-error" role="alert">{error}</div>}

          <div className="eht-composer" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addFiles(event.dataTransfer.files); }}>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onPaste={event => { if (event.clipboardData.files?.length) { event.preventDefault(); addFiles(event.clipboardData.files); } }}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); sendMessage(); }
              }}
              rows="2" maxLength="8000" placeholder="Ask about your trip or attach a document…" aria-label="Message the travel assistant"
            />
            <div className="eht-composer-actions">
              <div className="eht-media-actions">
                <input ref={fileRef} type="file" multiple hidden onChange={event => addFiles(event.target.files)} />
                <button onClick={() => fileRef.current?.click()} className="eht-tool-button" aria-label="Attach files" title="Attach files">＋<span>File</span></button>
                <button onClick={() => startRecording("audio")} disabled={!!recording} className="eht-tool-button" aria-label="Record a voice message" aria-pressed={recording === "audio"} title="Record voice">●<span>Voice</span></button>
                <button onClick={() => startRecording("video")} disabled={!!recording} className="eht-tool-button" aria-label="Record a video message" aria-pressed={recording === "video"} title="Record video">▣<span>Video</span></button>
              </div>
              <button onClick={sendMessage} disabled={sending || (!draft.trim() && !attachments.length)} className="eht-send-button" aria-label="Send message">
                {sending ? <span className="spinner"/> : <Icon.arrow size={17}/>} Send
              </button>
            </div>
          </div>
          <div className="eht-privacy-note">Files expire after processing · Order access is read-only</div>
        </section>
      )}

      {!open && (
        <button ref={launcherRef} onClick={() => setOpen(true)} className="eht-assistant-launcher" aria-label="Open travel assistant" aria-expanded="false" aria-controls="eht-travel-assistant">
          <span className="eht-launcher-icon"><Icon.plane size={20}/></span>
          <span><strong className="serif">Ask EHTravel</strong><small>Chat · voice · video · files</small></span>
        </button>
      )}
    </div>
  );
};

window.FloatingTravelAssistant = FloatingTravelAssistant;
