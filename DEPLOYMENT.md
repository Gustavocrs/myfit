# 📦 Guia de Deployment com Docker

Este guia explica como fazer deploy da aplicação MyFit em um servidor usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker instalado (versão 24+)
- Docker Compose instalado (versão 2.20+)
- Node.js 20+ (apenas para desenvolvimento local)
- Variáveis de ambiente Firebase configuradas

## 🚀 Deployment Rápido

### 1. Preparar Variáveis de Ambiente

Crie um arquivo `.env` ou `.env.production` no servidor:

```bash
# .env (ou copiar do .env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2. Criar Diretórios de Upload no Servidor

```bash
# Criar diretório raiz
mkdir -p ~/myfit-app && cd ~/myfit-app

# Criar diretório para uploads com permissões apropriadas
mkdir -p uploads
chmod 777 uploads

# Criar diretório para volumes Docker
mkdir -p docker-volumes/uploads
chmod 777 docker-volumes/uploads
```

### 3. Clonar Repositório e Construir

```bash
# Clonar o repositório
git clone <seu-repo> .

# Construir imagem Docker
docker-compose build

# Ou pull se estiver em registro
docker pull myfit:latest
```

### 4. Iniciar a Aplicação

```bash
# Iniciar serviços em background
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f myfit

# Parar serviços
docker-compose down
```

## 📂 Estrutura de Diretórios no Servidor

```
~/myfit-app/
├── .env                      # Variáveis de ambiente
├── docker-compose.yml        # Configuração de orquestração
├── Dockerfile               # Definição da imagem
├── docker-volumes/
│   └── uploads/            # Volume persistente para uploads
├── package.json
├── src/
├── public/
└── ...
```

## 🔒 Segurança de Uploads

### Permissões de Arquivo

```bash
# Dar permissão ao usuário do Docker
sudo chown -R 1001:1001 ~/myfit-app/docker-volumes/uploads

# Ou deixar genérico (menos seguro)
chmod 777 ~/myfit-app/docker-volumes/uploads
```

### Validação de Arquivo na API

A rota `/api/upload` (POST) já valida:

- ✅ Nome de arquivo único (timestamp)
- ✅ Extensão de arquivo
- ✅ Proteção contra path traversal
- ✅ MIME type detection

A rota `/api/files/[filename]` (GET) valida:

- ✅ Caracteres inválidos no nome
- ✅ Path traversal (../../../)
- ✅ MIME type apropriado
- ✅ Cache headers para performance

## 🔄 Volume Docker Persistente

O `docker-compose.yml` cria um volume nomeado para uploads:

```yaml
volumes:
  uploads_volume:
    driver: local
```

**Recuperar arquivos após reinicialização:**

```bash
docker-compose exec myfit ls /app/public/uploads
```

**Limpar volume (⚠️ destructivo):**

```bash
docker volume rm myfit_uploads_volume
```

## 📊 Comandos Úteis

### Ver logs em tempo real

```bash
docker-compose logs -f myfit --tail=100
```

### Acessar shell do container

```bash
docker-compose exec myfit sh
```

### Verificar saúde da aplicação

```bash
docker-compose ps
# Se o status for "healthy", está tudo bem
```

### Rebuild da imagem (após mudanças)

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Limpar recursos antigos

```bash
docker system prune -a
```

## 🌐 Configurar Reverse Proxy (Nginx)

Se quiser rodar em porta 80/443 com Nginx:

```nginx
upstream myfit_backend {
    server myfit:3000;
}

server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://myfit_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache de arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        proxy_pass http://myfit_backend;
        proxy_cache_valid 200 30d;
        proxy_cache_valid 404 1h;
        expires 30d;
    }

    # Uploads (não cachear)
    location /api/files/ {
        proxy_pass http://myfit_backend;
        proxy_cache off;
    }
}
```

## 🔍 Troubleshooting

### Erro: "public/uploads não existe"

```bash
# Docker cria automaticamente, mas se tiver problema:
docker-compose exec myfit mkdir -p /app/public/uploads
docker-compose exec myfit chmod 777 /app/public/uploads
```

### Erro: "Permissão negada ao salvar arquivo"

```bash
# Verificar proprietário
docker-compose exec myfit ls -la /app/public/
# Deve ser: nextjs:nodejs

# Corrigir permissões
docker-compose exec myfit chmod -R 777 /app/public/uploads
```

### Erro: "Porta 3000 já em uso"

```bash
# Mudar porta no docker-compose.yml
# Alterar: ports: - "3001:3000"
docker-compose up -d
```

### Erro de memória ou CPU

```bash
# Aumentar limite no docker-compose.yml
services:
  myfit:
    mem_limit: 512m
    cpus: 1.0
```

## 📈 Performance

### Otimizações Habilitadas

- ✅ Multi-stage build (menor imagem)
- ✅ Alpine Linux (77MB vs 500MB)
- ✅ Cache control para arquivos estáticos
- ✅ Health checks automáticos
- ✅ Restart policy automático

### Tamanho da Imagem

```bash
docker images | grep myfit
# Esperado: ~150-200MB
```

### Monitoramento

```bash
# Usar ferramentas externas:
- Portainer (UI para Docker)
- DataDog
- New Relic
- CloudWatch (AWS)
```

## 🔐 Backup e Restauração

### Backup de uploads

```bash
docker run --rm \
  -v myfit_uploads_volume:/uploads \
  -v ~/backups:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /uploads .
```

### Restaurar uploads

```bash
docker run --rm \
  -v myfit_uploads_volume:/uploads \
  -v ~/backups:/backup \
  alpine tar xzf /backup/uploads-20240101.tar.gz -C /uploads
```

## 📝 Atualizações

### Atualizar código

```bash
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

### Rollback para versão anterior

```bash
git checkout <commit-hash>
docker-compose build
docker-compose up -d
```

## ✅ Checklist pré-produção

- [ ] Variáveis de ambiente configuradas
- [ ] Diretórios de uploads criados
- [ ] SSL/TLS configurado (se usar Nginx)
- [ ] Backup strategy definida
- [ ] Monitoramento ativado
- [ ] Firewall configurado
- [ ] Docker e Docker Compose atualizados
- [ ] Teste de upload bem-sucedido

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `docker-compose logs -f`
2. Testar conexão API: `curl http://localhost:3000/`
3. Verificar volumes: `docker volume ls`
4. Limpar cache: `docker system prune -a`
