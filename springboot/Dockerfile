# 1단계: Gradle과 JDK를 함께 사용하는 빌드 이미지
FROM gradle:8.0-jdk17 AS build

# 작업 디렉토리 설정
WORKDIR /app

# 캐시 활용을 위한 Gradle 설정 파일 먼저 복사
COPY settings.gradle build.gradle /app/
COPY gradle /app/gradle

# 의존성만 먼저 다운로드하여 캐시 활용
RUN gradle --no-daemon dependencies

# 소스 코드 복사
COPY . /app

# 애플리케이션 빌드
RUN gradle build --no-daemon

# 2단계: 경량 JDK 이미지에서 실행
FROM openjdk:17-slim

# 보안 강화를 위해 불필요한 파일 제거 및 사용자 설정
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

# 소유권 변경
RUN chown appuser:appgroup /app/app.jar

USER appuser

EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
