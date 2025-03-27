# 빌드 단계
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .env .env

RUN npm run build

# 운영 단계
FROM nginx:alpine

# Nginx 설정 파일을 복사
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# React 앱 빌드 결과물을 Nginx의 기본 html 폴더로 복사
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]  # Nginx 실행
