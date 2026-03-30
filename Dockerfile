# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Declarar argumentos de build para as chaves do Firebase
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

# Definir as variáveis de ambiente para o build
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

# Instalar dependências com a flag explícita (substitui a necessidade do .npmrc)
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover dependências de desenvolvimento para otimizar a imagem final
RUN npm prune --production --legacy-peer-deps

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

# Usar dumb-init para executar o app
ENTRYPOINT ["dumb-init", "--"]

# Iniciar a aplicação
CMD ["npm", "start"]
