# 1단계: 빌드 스테이지
FROM openjdk:17-jdk-slim AS build
WORKDIR /app
ENV GRADLE_USER_HOME=/app/.gradle

# Gradle 의존성 캐시 활용
COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle
COPY gradlew /app/gradlew
RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon || true

# 프로젝트 소스 복사
COPY . /app

# Gradle 빌드 (테스트 제외)
RUN ./gradlew bootJar --no-daemon -x test

# 2단계: 실행 스테이지
FROM openjdk:17-slim
WORKDIR /app

# ffmpeg 설치 (문제 해결을 위해 --fix-missing 옵션 추가)
RUN apt-get update && \
    apt-get install -y ffmpeg --fix-missing && \
    rm -rf /var/lib/apt/lists/*

# 또는 미러 서버 변경하여 재시도
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y ffmpeg --fix-missing && \
    rm -rf /var/lib/apt/lists/*

# 빌드 스테이지에서 .jar 파일만 복사하여 최종 이미지에 포함
COPY --from=build /app/build/libs/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
