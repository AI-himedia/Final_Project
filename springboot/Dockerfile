# 1단계: Gradle + JDK17 빌드 이미지 사용
FROM gradle:8.0-jdk17 AS build

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 캐시 디렉토리 명시 (Docker 컨테이너에서 권한 문제 방지)
ENV GRADLE_USER_HOME=/app/.gradle

# 캐시 디렉토리 초기화 및 권한 설정
RUN rm -rf /app/.gradle && mkdir -p /app/.gradle && chmod -R 777 /app/.gradle

# Gradle 설정 파일 먼저 복사하여 캐시 최대한 활용
COPY settings.gradle build.gradle /app/
COPY gradle /app/gradle

# 나머지 전체 소스 복사
COPY . /app

# gradle.properties 복사 (캐시 비활성화 설정 포함 시)
COPY gradle.properties /app/gradle.properties

# 애플리케이션 빌드 - 캐시 무시하고 깨끗한 환경에서 수행
RUN gradle clean build --no-daemon --no-build-cache --refresh-dependencies --stacktrace


# 2단계: 경량 실행 이미지 생성
FROM openjdk:17-slim

# 전용 사용자 생성 (보안 강화를 위한 루트 계정 사용 지양)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# 실행 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

# 권한 변경
RUN chown appuser:appgroup /app/app.jar

# 일반 사용자로 실행
USER appuser

# 앱 포트 노출
EXPOSE 8080

# 앱 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
