# Blog Backend Documentation

## Components

### 1. Core Server (`server.js`)
- Express.js server configuration 
- CORS and security middleware setup
- CSRF token generation and validation
- Static file serving
- API route management
- Cookie handling

### 2. Database Management (`models/schema.js`, `models/db.js`)
- SQLite database initialization and connection
- Schema management for:
  * Users table (authentication)
  * Blog posts table (content)
  * Images table (media)
- Database transactions handling

### 3. Route Handlers
- **Authentication** (`routes/auth.js`, `handlers/auth.js`)
  * User registration and login
  * Password management
  * Session handling
  * Token refresh

- **Blog Posts** (`routes/posts.js`, `handlers/posts.js`)
  * CRUD operations for posts
  * Post status management
  * Featured/published posts
  * Post recovery system
  * Image association

- **Image Management** (`routes/images.js`, `handlers/images.js`)
  * Image upload handling
  * Image processing
  * Image metadata management
  * Image deletion

- **Logging** (`routes/logs.js`, `handlers/logs.js`)
  * System activity logging
  * Log retrieval
  * Log cleanup

### 4. Security Components
- **Authentication** (`middleware/auth.js`)
  * JWT token validation
  * Session management
  * Access control

- **CSRF Protection**
  * Token generation and validation
  * Request validation for state-changing operations

### 5. Utility Services
- **Image Processing** (`utils/imageProcessor.js`)
  * Image optimization
  * Metadata removal
  * Size standardization

- **Logging System** (`utils/logger.js`)
  * CEF format logging
  * Event tracking
  * Activity monitoring

- **Validation** (`utils/validators.js`)
  * Input sanitization
  * User data validation
  * Password requirements

### 6. Backup System
- **Core Functionality**
  * Automated database and file system backups
  * Retention policy management
  * Integrity verification

- **Tools Used**
  * SQLite .backup utility
  * tar/gzip compression
  * Shell scripts
  * Cron scheduling

- **Backup Strategy**
  * Daily backups (7-day retention)
  * Monthly backups (3-month retention)

- **Security Measures**
  * Backup encryption
  * Integrity verification
  * Secure files transfer

## Basic Workflow

1. **Authentication Flow**:
   - User authenticates via login endpoint
   - JWT token is issued
   - CSRF protection is activated
   - Session is maintained via cookies

2. **Content Management**:
   - Posts can be created, updated, deleted
   - Images are processed and optimized
   - Content is validated and sanitized
   - Changes are logged in CEF format

3. **Image Handling**:
   - Images are uploaded and processed
   - Metadata is stripped
   - Images are associated with posts
   - Automatic cleanup on post deletion

4. **Security**:
   - All routes are protected with authentication
   - CSRF tokens protect state changes
   - Input sanitization prevents injection
   - Token whitelist maintains valid sessions

## API Structure

### Authentication Endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- PUT `/api/auth/password`
- GET `/api/auth/check`

### Blog Post Endpoints
- GET `/api/posts`
- POST `/api/posts`
- GET `/api/posts/featured`
- GET `/api/posts/published`
- GET `/api/posts/:id`
- PUT `/api/posts/:id`
- DELETE `/api/posts/:id`

### Image Management Endpoints
- POST `/api/images/upload`
- POST `/api/images/upload-article`
- DELETE `/api/images`
- PUT `/api/images/alt`

### Logging Endpoints
- GET `/api/logs`
- DELETE `/api/logs/:timestamp`
- DELETE `/api/logs/filtered`