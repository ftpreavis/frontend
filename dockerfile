# frontend/Dockerfile
# 1) Build your Vite + Vue app
FROM node:24-bookworm AS build
WORKDIR /app

# Install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Serve with nginx
FROM nginx:stable-alpine

# If you want SPA-fallback inside the container, uncomment:
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files into nginx’s webroot
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/wait-for-vault.sh /wait-for-vault.sh
RUN chmod +x /wait-for-vault.sh

EXPOSE 80
CMD ["/bin/sh", "-c", "/wait-for-vault.sh && exec nginx -g daemon off;"]
