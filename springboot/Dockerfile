# 1단계: Gradle과 JDK를 함께 사용하는 빌드 이미지.
FROM gradle:8.0-jdk17 AS build

# Gradle 캐시 저장 디렉토리 설정
ENV GRADLE_USER_HOME=/home/gradle/.gradle

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 설정 관련 파일 먼저 복사 (캐시 활용 목적)
COPY settings.gradle build.gradle /app/
COPY gradle /app/gradle

# 의존성만 먼저 다운로드
RUN gradle dependencies --no-daemon || return 0

# 소스 전체 복사
COPY . /app

# 실제 빌드 실행
RUN gradle build --no-daemon

# 2단계: 경량 JDK 이미지에서 실행
FROM openjdk:17-slim

# 유저 및 그룹 생성 (보안 강화)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# 빌드된 JAR 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

# 실행 권한 및 소유권 변경
RUN chown appuser:appgroup /app/app.jar

# 비루트 권한 실행
USER appuser

# 애플리케이션 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
