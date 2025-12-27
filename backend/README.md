# pet-co Traditional - Backend

A Spring Boot REST API backend for pet-co Traditional organic products e-commerce platform.

## 🚀 Features

- **Spring Boot 3.5.5** - Latest Spring Boot framework
- **Spring Data JPA** - Database persistence and ORM
- **MySQL Database** - Relational database for data storage
- **Spring Security** - Authentication and authorization
- **RESTful APIs** - Complete REST API endpoints
- **File Upload** - Product image upload and management
- **Cross-Origin Support** - CORS configuration for frontend integration
- **Transaction Management** - Database transaction handling
- **Data Validation** - Input validation and error handling

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Database Setup**
   - Install MySQL and create a database:
   ```sql
   CREATE DATABASE pet-co;
   ```

3. **Configuration**
   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/pet-co
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

4. **Build and Run**
   ```bash
   # Build the project
   mvn clean compile

   # Run the application
   mvn spring-boot:run
   ```

   Or using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

5. **Access the API**
   - API Base URL: `http://localhost:8081/api`
   - Admin endpoints: `http://localhost:8081/api/admin/*`

## 📁 Project Structure

```
src/main/java/com/eduprajna/
├── config/             # Configuration classes
├── Controller/         # REST API controllers
├── dto/               # Data Transfer Objects
├── entity/            # JPA entity classes
├── repository/        # Data repository interfaces
├── service/           # Business logic services
└── pet-coApplication.java  # Main application class

src/main/resources/
├── application.properties  # Application configuration
└── static/            # Static resources (uploaded images)
```

## 🗄️ Database Schema

### Core Entities
- **Product** - Product catalog with details, pricing, and inventory
- **User** - Customer accounts and authentication
- **Order** - Customer orders and order items
- **OrderItem** - Individual items within orders
- **CartItem** - Shopping cart items
- **WishlistItem** - User wishlist items
- **Address** - Customer delivery addresses

## 🔌 API Endpoints

### Product Management
- `GET /api/admin/products` - Get all products
- `GET /api/admin/products/{id}` - Get product by ID
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `GET /api/admin/products/images/{filename}` - Serve product images

### Order Management
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/{id}` - Get order by ID
- `PUT /api/admin/orders/{id}/status` - Update order status

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user account
- `PUT /api/users/{id}` - Update user profile

### Cart & Wishlist
- `GET /api/cart` - Get user cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/{id}` - Remove from wishlist

## 🔐 Security

The application implements:
- CORS configuration for frontend integration
- Request/Response logging for debugging
- Input validation and sanitization
- Error handling and appropriate HTTP status codes

## 🚀 Deployment

1. **Build the JAR file**
   ```bash
   mvn clean package -DskipTests
   ```

2. **Run the JAR**
   ```bash
   java -jar target/pet-co-0.0.1-SNAPSHOT.jar
   ```

3. **Docker Deployment** (Optional)
   ```dockerfile
   FROM openjdk:17-jdk-slim
   COPY target/pet-co-0.0.1-SNAPSHOT.jar app.jar
   EXPOSE 8081
   ENTRYPOINT ["java", "-jar", "/app.jar"]
   ```

## 🔧 Development

### Building
```bash
mvn clean compile
```

### Running Tests
```bash
mvn test
```

### Cloudinary image uploads (recommended)

This project can upload product images to Cloudinary instead of storing them in the local `uploads/` folder.

1. Create a Cloudinary account and get your credentials (cloud name, api key, api secret). The SDK supports a single `CLOUDINARY_URL` environment variable in the format:

```
cloudinary://<api_key>:<api_secret>@<cloud_name>
```

2. For local development on Windows PowerShell, set the env var before running the app:

```powershell
$env:CLOUDINARY_URL = 'cloudinary://12345:abcd@mycloud'
mvn spring-boot:run
```

3. In production, set `CLOUDINARY_URL` in your host/environment (e.g., Vercel, Docker secrets, Kubernetes secrets).

4. Test upload with curl (multipart/form-data):

```bash
curl -X POST "http://localhost:8081/api/admin/products" \
   -F 'product={"name":"Test","price":10.0};type=application/json' \
   -F "image=@/path/to/file.jpg"
```

After a successful upload the `imageUrl` field stored in the product will contain a Cloudinary secure URL which the frontend can use directly.

### Code Style
Follow Spring Boot and Java best practices:
- Use proper package structure
- Implement proper exception handling
- Add appropriate logging
- Document API endpoints

## 📄 License

This project is licensed under the MIT License.