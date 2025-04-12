# 1단계: 빌드 스테이지
FROM openjdk:17-jdk-slim AS build

WORKDIR /app

ENV GRADLE_USER_HOME=/app/.gradle

COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle
COPY gradlew /app/gradlew

RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon || true

COPY . /app

RUN ./gradlew bootJar --no-daemon -x test

# 2단계: 실행 스테이지
FROM openjdk:17-slim

WORKDIR /app

COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080

# 실행 시점에 환경 변수 적용
# ENV SPRING_PROFILES_ACTIVE=prod
# 잘 모르겠지만,,  "--spring.profiles.active=${SPRING_PROFILES_ACTIVE}" 을 이미 application.yml에 넣었는데 여기도 넣어야할까..?
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.profiles.active=${SPRING_PROFILES_ACTIVE}"]
