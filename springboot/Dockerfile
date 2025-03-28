# 1단계: Gradle을 사용하여 Spring Boot 애플리케이션 빌드
FROM gradle:8.0-jdk21 as build

WORKDIR /app

# 프로젝트의 build.gradle 파일 복사 및 의존성 설치
COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle

# 의존성 캐시를 위해 Gradle 빌드 시 go-offline 수행
RUN gradle --no-daemon build --refresh-dependencies --stacktrace

# 프로젝트 소스 복사
COPY src /app/src

# Spring Boot 애플리케이션 빌드 (JAR 파일 생성)
RUN gradle bootJar --no-daemon

# 2단계: JDK를 포함한 경량 이미지를 사용하여 애플리케이션 실행
FROM openjdk:21-slim

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

# 8080 포트 열기 (Spring Boot 기본 포트)
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
