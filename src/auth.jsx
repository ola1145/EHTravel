// Clerk browser authentication. Only the publishable key is injected into the page;
// the secret key and ownership metadata remain in the assistant service.
const EHT_CLERK_PUBLISHABLE_KEY =
  document.querySelector('meta[name="clerk-publishable-key"]')?.content?.trim() || "";

let ehtClerkPromise;

function clerkFrontendApi(publishableKey) {
  try {
    const encoded = publishableKey.split("_")[2];
    return atob(encoded).replace(/\$$/, "");
  } catch {
    return "";
  }
}

function loadClerkScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
    script.addEventListener("load", () => { script.dataset.loaded = "true"; resolve(); }, { once: true });
    script.addEventListener("error", () => reject(new Error("Clerk could not be loaded")), { once: true });
    document.head.appendChild(script);
  });
}

async function initializeClerk() {
  if (!EHT_CLERK_PUBLISHABLE_KEY) return null;
  if (ehtClerkPromise) return ehtClerkPromise;
  ehtClerkPromise = (async () => {
    const frontendApi = clerkFrontendApi(EHT_CLERK_PUBLISHABLE_KEY);
    if (!frontendApi) throw new Error("The Clerk publishable key is invalid");
    const base = `https://${frontendApi}/npm`;
    await loadClerkScript(`${base}/@clerk/ui@1/dist/ui.browser.js`);
    await loadClerkScript(`${base}/@clerk/clerk-js@6/dist/clerk.browser.js`, {
      "data-clerk-publishable-key": EHT_CLERK_PUBLISHABLE_KEY,
    });
    if (!window.Clerk) throw new Error("Clerk did not initialize");
    await window.Clerk.load({
      ...(window.__internal_ClerkUICtor ? { ui: { ClerkUI: window.__internal_ClerkUICtor } } : {}),
    });
    return window.Clerk;
  })();
  return ehtClerkPromise;
}

// api.jsx requests a fresh short-lived session token for each authenticated request.
window.EHT_GET_AUTH_TOKEN = async () => {
  const clerk = await initializeClerk().catch(() => null);
  return clerk?.session ? clerk.session.getToken() : null;
};

const ClerkAuthControl = () => {
  const [clerk, setClerk] = React.useState(null);
  const [state, setState] = React.useState(EHT_CLERK_PUBLISHABLE_KEY ? "loading" : "unavailable");
  const [showSignIn, setShowSignIn] = React.useState(false);
  const userButtonRef = React.useRef(null);
  const signInRef = React.useRef(null);

  React.useEffect(() => {
    let active = true;
    let unsubscribe;
    initializeClerk()
      .then(instance => {
        if (!active || !instance) return;
        setClerk(instance);
        const sync = () => {
          if (!active) return;
          setState(instance.session ? "signedIn" : "signedOut");
          if (instance.session) setShowSignIn(false);
        };
        sync();
        unsubscribe = instance.addListener(sync);
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (!clerk || state !== "signedIn" || !userButtonRef.current) return;
    clerk.mountUserButton(userButtonRef.current, {
      afterSignOutUrl: window.location.origin,
      appearance: { variables: { colorPrimary: "#b54a1d" } },
    });
    return () => clerk.unmountUserButton(userButtonRef.current);
  }, [clerk, state]);

  React.useEffect(() => {
    if (!clerk || !showSignIn || !signInRef.current) return;
    clerk.mountSignIn(signInRef.current, {
      routing: "virtual",
      appearance: { variables: { colorPrimary: "#b54a1d", colorText: "#0b1a2b" } },
    });
    return () => clerk.unmountSignIn(signInRef.current);
  }, [clerk, showSignIn]);

  const modal = showSignIn && clerk
    ? ReactDOM.createPortal(
      <div className="eht-auth-overlay" role="dialog" aria-modal="true" aria-label="Sign in to EHTravel" onMouseDown={event => event.target === event.currentTarget && setShowSignIn(false)}>
        <div className="eht-auth-modal">
          <button className="eht-auth-modal-close" onClick={() => setShowSignIn(false)} aria-label="Close sign in">×</button>
          <div ref={signInRef}/>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <div className="eht-auth-control">
        {state === "signedIn" && <div ref={userButtonRef} className="eht-clerk-user-button" aria-label="EHTravel account"/>}
        {state === "signedOut" && <button className="eht-sign-in-button" onClick={() => setShowSignIn(true)}>Sign in</button>}
        {state === "loading" && <span className="eht-auth-loading" aria-label="Loading sign in"><span className="spinner"/></span>}
        {state === "error" && <button className="eht-sign-in-button" onClick={() => window.location.reload()} title="Reload authentication">Retry sign in</button>}
      </div>
      {modal}
    </>
  );
};

window.ClerkAuthControl = ClerkAuthControl;
