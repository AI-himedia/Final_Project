# 빌드 단계
FROM node:18-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# package 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 프로젝트 전체 파일 복사
COPY . .

# 환경 변수 파일 복사
COPY .env .env

# 프로젝트 빌드
RUN npm run build

# 운영 단계
FROM nginx:alpine

# 빌드한 정적 파일을 nginx의 기본 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

# (선택) nginx 설정파일을 덮어쓸 경우 사용
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
