# 1. Imagen base ligera de Node.js
FROM node:18-alpine AS base

# 2. Etapa de dependencias
FROM base AS deps
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json* ./

# Instalar dependencias (usamos npm ci para instalaciones limpias)
RUN npm ci

# 3. Etapa de construcción (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED 1

# Construir la aplicación
RUN npm run build

# 4. Etapa de producción (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Exponer el puerto (Render inyectará la variable PORT automáticamente)
EXPOSE 10000

# Ejecutar tu servidor personalizado
CMD ["node", "server.js"]