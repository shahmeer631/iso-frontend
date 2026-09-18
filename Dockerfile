# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate \
  && pnpm install --frozen-lockfile

# ---------- Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate \
  && pnpm build

# ---------- Runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3011

# create user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only needed files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/next-intl.config.ts ./next-intl.config.ts

# install ONLY production deps via npm
RUN npm install --omit=dev

USER nextjs

EXPOSE 3011

CMD ["npm", "start"]