# Base comum com pnpm habilitado
FROM node:20-slim AS base
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /usr/src/app

# -------- Build deps (para sqlite3/better-sqlite3) --------
FROM base AS deps
# ferramentas para compilar nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Instala só as deps com cache eficiente
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# -------- Build (transpila Nest) --------
FROM deps AS build
COPY . .
# se seu build usa Nest CLI/tsc, isso vai rodar
RUN pnpm build

# Remove dev deps e deixa só prod
RUN pnpm prune --prod

# -------- Production --------
FROM node:20-slim AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Cria pasta para banco de dados e ajusta permissões
RUN mkdir -p /usr/src/app/data \
  && chown -R node:node /usr/src/app

# Copia apenas o necessário
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package.json ./

# Troca para o usuário node (não-root)
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
