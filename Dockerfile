# Dockerfile pour l'application Next.js de transcription vocale

# Étape 1: Build de l'application
FROM node:22-alpine AS builder

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml* ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le reste des fichiers
COPY . .

# Build de l'application Next.js
RUN pnpm build

# Étape 2: Image de production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Changer les permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Démarrer l'application
CMD ["node", "server.js"]
