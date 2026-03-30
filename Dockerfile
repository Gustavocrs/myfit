# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN mkdir -p /app/public/uploads && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
