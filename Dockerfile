# syntax=docker/dockerfile:1.7

# Etapa 1: Base
FROM node:20-alpine AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_FETCH_RETRIES=3 \
    NPM_CONFIG_FETCH_RETRY_FACTOR=2 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=10000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=60000 \
    NPM_CONFIG_FETCH_TIMEOUT=120000 \
    NPM_CONFIG_LOGLEVEL=verbose \
    NPM_CONFIG_MAXSOCKETS=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

FROM base AS deps

# Copiar arquivos de dependências
COPY package*.json ./
COPY .npmrc ./

# Instalar dependências com cache persistente do npm para reduzir timeout de rede
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --prefer-offline --verbose

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Garantir que o diretório public exista, mesmo que vazio, para evitar falhas no COPY
RUN mkdir -p public

# Build da aplicação
RUN npm run build

# Remover dependências de desenvolvimento para otimizar a imagem final
RUN npm prune --production --legacy-peer-deps

# Etapa 2: Runtime (otimizado)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copiar dependências do builder (apenas as usadas em produção)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package*.json ./

# Criar diretório de uploads com permissões apropriadas
RUN mkdir -p /app/public/uploads

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Trocar proprietário dos diretórios
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Iniciar a aplicação
CMD ["npm", "start"]
