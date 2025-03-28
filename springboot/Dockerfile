# 1단계: Gradle과 JDK를 함께 사용하는 이미지
FROM openjdk:21-slim as build

# Gradle 설치
RUN apt-get update && apt-get install -y wget \
    && wget https://services.gradle.org/distributions/gradle-8.0-bin.zip \
    && unzip gradle-8.0-bin.zip -d /opt/ \
    && ln -s /opt/gradle-8.0/bin/gradle /usr/bin/gradle \
    && rm gradle-8.0-bin.zip

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 관련 파일 복사
COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle

# 의존성 다운로드 및 빌드
RUN gradle --no-daemon build --refresh-dependencies --stacktrace

# 2단계: JDK 경량 이미지에서 실행
FROM openjdk:21-slim

# 애플리케이션 실행을 위한 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
