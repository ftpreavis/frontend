# frontend/Dockerfile
# 1) Build your Vite + Vue app
FROM node:18-alpine AS build
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

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
