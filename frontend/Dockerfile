# 빌드 단계
FROM node:18-alpine as build

WORKDIR /app

# React 앱 의존성 설치
COPY package*.json ./
RUN npm install

# 프로젝트 파일 복사 및 빌드
COPY . .
RUN npm run build

# 실행 단계
FROM node:18-alpine

WORKDIR /app

# 빌드된 결과물을 새로운 이미지로 복사
COPY --from=build /app/build /app/build

# 포트 열기
EXPOSE 80

# 앱 실행
CMD ["npx", "serve", "-s", "build", "-l", "80"]