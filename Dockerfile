# ===== build =====
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# add flags if you need a specific base-href:
# ARG BASE_HREF=/
# RUN npm run build -- --configuration production --base-href ${BASE_HREF}
RUN npm run build -- --configuration production

# ===== serve with nginx =====
FROM nginx:alpine
# SPA routing: handle deep links by serving index.html
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy Angular dist (adjust "ui-workflow" to your actual output subfolder name)
COPY --from=build /app/dist/ui-workflow /usr/share/nginx/html
EXPOSE 80
