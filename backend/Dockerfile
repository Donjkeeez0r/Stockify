# ==========================================
# ЭТАП 1: Сборка приложения (Builder)
# ==========================================
FROM node:24-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

# Копируем package.json и лок-файл pnpm (если он существует)
COPY package.json ./
COPY prisma ./prisma/

# Устанавливаем ВСЕ зависимости (аналог npm ci)
RUN pnpm install

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем код и компилируем TypeScript
COPY . .
RUN pnpm run build

# ==========================================
# ЭТАП 2: Продакшен образ (Runner)
# ==========================================
FROM node:24-alpine

# На новом чистом этапе тоже нужно включить pnpm
RUN corepack enable pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts

# 1. Устанавливаем только продакшен зависимости (--prod)
# 2. ДОБАВЛЯЕМ Prisma CLI локально для docker-compose
RUN pnpm install --prod && pnpm add prisma

# Генерируем клиент для продакшен-окружения
RUN npx prisma generate
# Забираем только готовый JS-код из первого этапа
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
