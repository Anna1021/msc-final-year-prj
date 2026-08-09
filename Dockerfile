FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    PORT=7860 \
    HF_HOME=/app/.cache/huggingface

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && node scripts/cache-live-model.mjs

EXPOSE 7860

CMD ["npm", "run", "start"]
