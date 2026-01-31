# 1. Usar imagen base ligera de Node.js
FROM node:18-alpine

# 2. Establecer directorio de trabajo
WORKDIR /app

# 3. Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# 4. Instalar dependencias (incluyendo dev para el build)
RUN npm install

# 5. Copiar el resto del código
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# 6. Exponer el puerto (Render usa 10000 internamente)
EXPOSE 10000

# 7. Iniciar el servidor
CMD ["node", "server.js"]