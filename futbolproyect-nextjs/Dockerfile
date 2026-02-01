FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=https://futbolproyect.onrender.com/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build




# Elimina EXPOSE 10000
CMD ["sh", "-c", "next start -H 0.0.0.0 -p $PORT"]
