# ---------- Build stage ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./

# Corporate VPN/proxy does TLS inspection - Node reads this cert directly, no OS trust store needed
COPY corporate-ca.crt /usr/local/share/ca-certificates/corporate-ca.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/corporate-ca.crt

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]