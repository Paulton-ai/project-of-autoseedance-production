FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

# FFmpeg is installed in the worker container, not the user's browser.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src

RUN mkdir -p /tmp/captions-uploads /tmp/captions-renders \
  && chown -R node:node /tmp/captions-uploads /tmp/captions-renders /app
USER node
EXPOSE 8080
CMD ["npm", "start"]
