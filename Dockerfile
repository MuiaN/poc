# ------------------------------------------------------------
#  Multi-stage build – production ready Next.js (standalone)
# ------------------------------------------------------------
# 1️⃣  Builder – install deps & compile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                     # clean, reproducible install
COPY . .
RUN npm run build               # creates .next/standalone + public + .next/static

# ------------------------------------------------------------
# 2️⃣  Runner – tiny runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy only the files required for `next start`
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]