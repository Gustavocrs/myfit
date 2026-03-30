# 🚀 Setup & Instruções de Instalação - MyFit

## 📋 Requisitos

### Mínimos (Local Development)

- Node.js 20+ (incluído: npm 10+)
- Git 2.40+

### Para Produção (Docker)

- Docker 24+
- Docker Compose 2.20+
- 512MB RAM mínimo
- 2GB espaço em disco

## 💻 Desenvolvimento Local

### 1. Clonar e Instalar

```bash
git clone <seu-repositorio> myfit
cd myfit

# Instalar dependências (usando versões latest)
npm install
```

### 2. Configurar Variáveis

Copiar `.env.local.example` para `.env.local`:

```bash
# Copiar de um projeto Firebase existente
cp .env.local.example .env.local
```

Adicionar suas credenciais Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave_api
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 3. Rodar em Desenvolvimento

```bash
npm run dev

# Acessar: http://localhost:3000
```

### 4. Verificar Saúde do Projeto

```bash
# Linting
npm run lint

# Formatação (Biome)
npm run format

# Build de produção (teste)
npm run build
npm start
```

## 🐳 Deployment com Docker

### Passo 1: Preparar Servidor

```bash
# SSH no servidor
ssh seu-usuario@seu-dominio.com

# Criar diretórios
mkdir -p ~/myfit-app
cd ~/myfit-app

# Criar arquivo .env
touch .env
nano .env

# Colar variáveis de ambiente (vide exemplo acima)
# Salvar: CTRL + O > ENTER > CTRL + X
```

### Passo 2: Clonar Projeto

```bash
git clone <seu-repositorio> .
# ou (se já tem clonado)
git pull origin main
```

### Passo 3: Construir e Rodar

```bash
# Construir imagem (primeira vez)
docker-compose build

# Iniciar em background
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f myfit --tail=50
```

### Passo 4: Validar Funcionamento

```bash
# Testar rota da API
curl http://localhost:3000/

# Testar upload
curl -X POST \
  -F "file=@/caminho/arquivo.jpg" \
  http://localhost:3000/api/upload

# Listar uploads
docker-compose exec myfit ls -la /app/public/uploads
```

## 📂 Estrutura de Pastas Criadas Automaticamente

Quando a aplicação inicia, automaticamente são criadas:

```
/app/
├── public/
│   └── uploads/           ← 📁 Criada automaticamente
├── .next/
├── node_modules/
└── ...
```

**Inicialização (startup.sh):**

1. Executado antes de npm start
2. Cria `/app/public/uploads` se não existir
3. Define permissões 777 para escrita
4. Inicia a aplicação Next.js

**Persistência (docker-compose.yml):**

1. Volume `uploads_volume` mapeia `/app/public/uploads`
2. Uploads persistem mesmo após `docker-compose down`
3. Recuperáveis em redeploy

## 🔄 Atualizações

### Local

```bash
git pull origin main
npm install
npm run build
npm run start  # Testar
npm run dev    # Continuar desenvolvendo
```

### Servidor

```bash
cd ~/myfit-app

# Atualizar código
git pull origin main

# Rebuildar imagem
docker-compose build --no-cache

# Reiniciar com nova imagem
docker-compose up -d

# Verificar
docker-compose logs -f myfit
```

## 🔒 Checklist de Segurança

- [ ] `.env` criado com variáveis Firebase
- [ ] `.env` não está no git (verificar .gitignore)
- [ ] Docker user é `nextjs` (uid 1001, não root)
- [ ] Permissões de arquivo são 777 ou 755
- [ ] HTTPS/SSL configurado (se produção)
- [ ] Firewall permite apenas portas necessárias
- [ ] Backups de uploads configurados
- [ ] Monitoramento/alertas habilitados

## 📊 Versões

Todas com versão **latest**:

| Dependência   | Versão       |
| ------------- | ------------ |
| Node.js       | latest (20+) |
| npm           | 10+          |
| Next.js       | 15+          |
| React         | 19+          |
| @mui/material | 6+           |
| tailwindcss   | 4+           |

## 🐛 Troubleshooting

### "Arquivo não existe após upload"

```bash
# Verificar permissões da pasta
docker-compose exec myfit ls -la /app/public/uploads

# Dar permissão se necessário
docker-compose exec myfit chmod -R 777 /app/public/uploads
```

### "Porta 3000 já em uso"

```bash
# Mudar porta no docker-compose.yml
# Linha: ports: - "3001:3000"

docker-compose down
docker-compose up -d
```

### "Docker/Docker Compose não encontrado"

```bash
# Instalar Docker (seguir docs.docker.com para seu SO)
# Ubuntu/Debian:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### "Erro de saúde do container"

```bash
docker-compose logs myfit
# Ver mensagem de erro e corrigir .env ou permissões
```

## 📞 Comandos Úteis

```bash
# Ver informações da imagem
docker images | grep myfit

# Ver status de volumes
docker volume ls

# Inspecionar logs em tempo real
docker-compose logs -f myfit --tail=100

# Acessar shell do container
docker-compose exec myfit sh

# Reiniciar container
docker-compose restart myfit

# Parar tudo
docker-compose down

# Limpar tudo (⚠️ cuidado)
docker system prune -a
```

## 🎯 Next Steps

1. **Desenvolvimento:**
   - Rodar `npm run dev`
   - Fazer mudanças
   - Testar upload em `/settings`

2. **Deploy:**
   - Configurar `.env` no servidor
   - Rodar `docker-compose up -d`
   - Testar `/api/upload` endpoint

3. **Produção:**
   - Configurar SSL/TLS
   - Adicionar Nginx proxy
   - Configurar backups automáticos
   - Monitoramento com Prometheus/Grafana

## 📖 Documentação Adicional

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia completo de produção
- [HOOKS_GUIDE.md](./HOOKS_GUIDE.md) - Documentação de hooks
- [FIREBASE_RULES.md](./FIREBASE_RULES.md) - Regras Firestore
- [README.md](./README.md) - Overview do projeto
