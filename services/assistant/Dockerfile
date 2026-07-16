FROM node:22-alpine
WORKDIR /app
COPY services/assistant ./services/assistant
EXPOSE 4100
CMD ["node", "services/assistant/server.mjs"]
