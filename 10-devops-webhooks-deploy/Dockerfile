# --- ÉTAPE 1 : Compilation TypeScript (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- ÉTAPE 2 : Image de Production légère ---
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Exécution sous un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER appuser
EXPOSE 3000

CMD ["node", "dist/server.js"]
