# 1. Usar imagen base ligera de Node.js
FROM node:18-alpine

# 2. Establecer directorio de trabajo
WORKDIR /app

# 3. Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# 4. Instalar dependencias (solo producción)
RUN npm install --omit=dev

# 5. Copiar el resto del código
COPY . .

# 6. Exponer el puerto (Render usa 10000 internamente)
EXPOSE 10000

# 7. Iniciar el servidor
CMD ["node", "server.js"]
