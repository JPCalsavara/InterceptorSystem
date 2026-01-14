# ====================================
# Stage 1: Build (para produção)
# ====================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build de produção
RUN npm run build --configuration=production

# ====================================
# Stage 2: Development (com hot-reload)
# ====================================
FROM node:20-alpine AS development

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências (incluindo devDependencies)
RUN npm install --legacy-peer-deps

# Expor porta do dev server
EXPOSE 4200

# Comando para desenvolvimento (com hot-reload)
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "1000"]

# ====================================
# Stage 3: Production (servir arquivos estáticos)
# ====================================
FROM nginx:alpine AS production

# Copiar build do stage 1
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copiar configuração customizada do nginx (se necessário)
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Nginx já roda por padrão
CMD ["nginx", "-g", "daemon off;"]

