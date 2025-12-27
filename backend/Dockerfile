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

# Expose port (Render will map this automatically)
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

# Run the jar with prod profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]