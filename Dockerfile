## Start with a base image

FROM maven:latest AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ARG PROJECT_VERSION= 0.0.1
FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app

COPY --from=builder /app/target/backend-*.jar /app/app.jar

EXPOSE 8888
ENTRYPOINT [ "java", "-jar", "app.jar" ]