FROM node:24-slim

RUN corepack enable pnpm

WORKDIR /app

COPY package.json ./

RUN pnpm install

COPY . .

EXPOSE 5173

CMD [ "pnpm", "run", "dev", "--host" ]