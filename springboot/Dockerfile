FROM gradle:8.0-jdk17 AS build

WORKDIR /app
ENV GRADLE_USER_HOME=/app/.gradle

RUN mkdir -p /app/.gradle && chmod -R 777 /app/.gradle

# Gradle 설정만 복사 (캐시 활용 목적)
COPY settings.gradle build.gradle /app/
COPY gradle /app/gradle

# 전체 복사
COPY . /app

# 빌드 실행
RUN gradle build --no-daemon --refresh-dependencies
