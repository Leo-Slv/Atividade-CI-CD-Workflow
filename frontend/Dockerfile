# --- dependências ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- build ---
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* é embutida no bundle em tempo de build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# --- execução ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
