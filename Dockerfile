# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências (usa .npmrc para legacy-peer-deps)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Etapa 2: Runtime (otimizado)
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para gerenciar processos
RUN apk add --no-cache dumb-init

# Copiar dependências do builder (apenas as usadas em produção)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Criar diretório de uploads com permissões apropriadas
RUN mkdir -p /app/public/uploads && chmod -R 777 /app/public/uploads

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

# Usar dumb-init para executar o app
ENTRYPOINT ["dumb-init", "--"]

# Iniciar a aplicação
CMD ["npm", "start"]
