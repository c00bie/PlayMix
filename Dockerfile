FROM node:24 AS build

COPY . /app
WORKDIR /app

ARG VITE_CLIENT_ID
ENV VITE_CLIENT_ID=${VITE_CLIENT_ID}
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /etc/nginx/conf.d && \
    cat > /etc/nginx/conf.d/default.conf <<EOF
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

EXPOSE 80