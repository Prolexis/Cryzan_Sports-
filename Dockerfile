# Stage 1: Base de dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    (npm ci || npm install)

# Stage 2: Compilación y Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 3: Runner de desarrollo / producción
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN chmod +x ./scripts/entrypoint.sh

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["./scripts/entrypoint.sh"]
CMD ["npm", "run", "dev"]
