# 1단계: 빌드 스테이지
FROM openjdk:17-jdk-slim AS build

WORKDIR /app

ENV GRADLE_USER_HOME=/app/.gradle

# Gradle 캐시 최적화
COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle
COPY gradlew /app/gradlew

RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon || true

# 전체 복사
COPY . /app

# 빌드 수행
RUN ./gradlew bootJar --no-daemon -x test

# 2단계: 실행 스테이지
FROM openjdk:17-slim

WORKDIR /app

COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
