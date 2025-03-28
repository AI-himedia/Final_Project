# 1단계: 빌드 단계 (Gradle Wrapper 사용.)
FROM openjdk:17-jdk-slim AS build

WORKDIR /app

# Gradle 캐시 최적화를 위한 미리 복사
COPY springboot/build.gradle springboot/settings.gradle /app/
COPY springboot/gradle /app/gradle
COPY springboot/gradlew /app/gradlew

# Gradle 캐시 디렉토리 설정
ENV GRADLE_USER_HOME=/app/.gradle

# 의존성만 먼저 다운 (캐시 활용)
RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon || true

# 전체 소스 복사
COPY springboot /app

# 빌드 수행 (테스트 제외)
RUN ./gradlew bootJar --no-daemon -x test

# 2단계: 실행 단계 (경량 JDK 이미지)
FROM openjdk:17-slim

WORKDIR /app

# 빌드한 JAR 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
