# 1단계: Gradle로 빌드
FROM gradle:8.0-jdk21 as build

WORKDIR /app

# 프로젝트 파일 복사 및 의존성 캐시
COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle

# 의존성 새로 고침, Gradle Daemon을 사용하지 않음
RUN gradle --no-daemon build --refresh-dependencies --stacktrace

# 프로젝트 소스 복사
COPY src /app/src

# Gradle로 Spring Boot 애플리케이션 빌드
RUN gradle bootJar --no-daemon

# 2단계: JDK 경량 이미지에서 실행
FROM openjdk:21-slim

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
