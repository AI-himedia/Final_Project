# 빌드 단계
FROM node:18-alpine as build

WORKDIR /app

# React 앱 의존성 설치
COPY package*.json ./
RUN npm install

# 프로젝트 파일 복사 및 빌드
COPY . .
COPY .env .env

RUN npm run build

# 운영 단계 (Nginx로 배포)
FROM nginx:alpine

# frontend/nginx/nginx.conf 파일을 Nginx의 설정 파일로 복사
# COPY frontend/nginx/nginx.conf /etc/nginx/nginx.conf

# React 앱 빌드 결과물을 Nginx의 기본 html 폴더로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 포트 열기
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]