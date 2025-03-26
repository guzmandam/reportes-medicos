# Medical Records API

A FastAPI-based REST API for managing medical records, documents, and patient information with role-based access control.

## Project Structure

```
api/
├── app/
│   ├── api/
│   │   └── api_v1/
│   │       ├── auth/         # Authentication endpoints
│   │       ├── documents/    # Document management endpoints
│   │       ├── patients/     # Patient management endpoints
│   │       ├── roles/        # Role management endpoints
│   │       └── users/        # User management endpoints
│   ├── core/
│   │   ├── config.py        # Application configuration
│   │   ├── database.py      # Database connection
│   │   ├── dependencies.py  # FastAPI dependencies
│   │   ├── init_db.py       # Database initialization
│   │   └── security.py      # Security utilities
│   ├── models/              # Pydantic models
│   └── utils/               # Utility functions
├── tests/                   # Test files
├── .env                     # Environment variables
├── requirements.txt         # Project dependencies
└── run.py                  # Application entry point
```

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control
  - User management

- **Document Management**
  - Document upload and storage
  - Automatic document analysis
  - Document status tracking
  - Extracted data management

- **Patient Management**
  - Patient record creation and updates
  - Patient information extraction from documents
  - Medical history tracking

- **Role Management**
  - Role-based permissions
  - Resource and action management
  - Admin-only role operations

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/token` - Get access token

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/` - List all users (admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID (admin only)
- `POST /api/v1/users/` - Create new user (admin only)
- `DELETE /api/v1/users/{user_id}` - Delete user (admin only)

### Documents
- `POST /api/v1/documents/upload` - Upload new document
- `GET /api/v1/documents/` - List documents
- `GET /api/v1/documents/{document_id}` - Get document by ID
- `GET /api/v1/documents/{document_id}/analyze` - Trigger document analysis
- `GET /api/v1/documents/{document_id}/extracted-data` - Get extracted data

### Patients
- `POST /api/v1/patients/` - Create new patient
- `GET /api/v1/patients/` - List all patients
- `GET /api/v1/patients/{patient_id}` - Get patient by ID
- `PUT /api/v1/patients/{patient_id}` - Update patient
- `POST /api/v1/patients/from-document/{document_id}` - Create patient from document

### Roles
- `GET /api/v1/roles/` - List all roles (admin only)
- `GET /api/v1/roles/{role_id}` - Get role by ID (admin only)
- `POST /api/v1/roles/` - Create new role (admin only)
- `GET /api/v1/roles/resources/list` - List available resources and actions

## Setup and Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URL=your_mongodb_url
   JWT_SECRET_KEY=your_jwt_secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. Run the application:
   ```bash
   python run.py
   ```

## Database

The application uses MongoDB as its database. The database will be automatically initialized with default roles and an admin user on first startup.

## Security

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Secure file upload handling
- Environment variable configuration

## Development

The project follows a modular structure with clear separation of concerns:
- Models: Data validation and serialization
- Core: Application configuration and utilities
- API: Route handlers and business logic
- Utils: Helper functions and shared code