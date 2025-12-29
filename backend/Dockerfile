# Multi-stage build for Render deployment
FROM eclipse-temurin:21-jdk-alpine AS builder

# Install Maven
RUN apk add --no-cache maven

# Set working directory
WORKDIR /app

# Copy Maven configuration files
COPY pom.xml ./
COPY mvnw ./
COPY mvnw.cmd ./
COPY .mvn ./.mvn/

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies first (for caching)
RUN ./mvnw dependency:resolve

# Copy source code
COPY src ./src/

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install curl for health check
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy jar file from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p uploads

# Expose default port (Render provides $PORT at runtime)
EXPOSE 8081

# Health check uses the runtime $PORT (falls back to 8080 if not provided)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD sh -c 'PORT=${PORT:-8081}; curl -f http://localhost:$PORT/actuator/health || exit 1'

# Run the jar; let Spring Boot pick up Render's $PORT (fallback to 8081) and use prod profile
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=prod -Dserver.port=${PORT:-8081} -jar app.jar"]