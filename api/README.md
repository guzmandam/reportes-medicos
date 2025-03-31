# API de Registros Médicos

Una API REST basada en FastAPI para gestionar registros médicos, documentos e información de pacientes con control de acceso basado en roles.

## Estructura del Proyecto

```
api/
├── app/
│   ├── api/
│   │   └── api_v1/
│   │       ├── auth/         # Endpoints de autenticación
│   │       ├── documents/    # Endpoints de gestión de documentos
│   │       ├── patients/     # Endpoints de gestión de pacientes
│   │       ├── roles/        # Endpoints de gestión de roles
│   │       └── users/        # Endpoints de gestión de usuarios
│   ├── core/
│   │   ├── config.py        # Configuración de la aplicación
│   │   ├── database.py      # Conexión a la base de datos
│   │   ├── dependencies.py  # Dependencias de FastAPI
│   │   ├── init_db.py       # Inicialización de la base de datos
│   │   └── security.py      # Utilidades de seguridad
│   ├── models/              # Modelos Pydantic
│   └── utils/               # Funciones de utilidad
├── tests/                   # Archivos de prueba
├── .env                     # Variables de entorno
├── requirements.txt         # Dependencias del proyecto
└── run.py                  # Punto de entrada de la aplicación
```

## Características

- **Autenticación y Autorización**
  - Autenticación basada en JWT
  - Control de acceso basado en roles
  - Gestión de usuarios

- **Gestión de Documentos**
  - Carga y almacenamiento de documentos
  - Análisis automático de documentos
  - Seguimiento del estado de documentos
  - Gestión de datos extraídos

- **Gestión de Pacientes**
  - Creación y actualización de registros de pacientes
  - Extracción de información de pacientes desde documentos
  - Seguimiento del historial médico

- **Gestión de Roles**
  - Permisos basados en roles
  - Gestión de recursos y acciones
  - Operaciones exclusivas para administradores

## Endpoints de la API

### Autenticación
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/signup` - Registro de usuario
- `POST /api/v1/auth/token` - Obtener token de acceso

### Usuarios
- `GET /api/v1/users/me` - Obtener usuario actual
- `GET /api/v1/users/` - Listar todos los usuarios (solo admin)
- `GET /api/v1/users/{user_id}` - Obtener usuario por ID (solo admin)
- `POST /api/v1/users/` - Crear nuevo usuario (solo admin)
- `DELETE /api/v1/users/{user_id}` - Eliminar usuario (solo admin)

### Documentos
- `POST /api/v1/documents/upload` - Subir nuevo documento
- `GET /api/v1/documents/` - Listar documentos
- `GET /api/v1/documents/{document_id}` - Obtener documento por ID
- `GET /api/v1/documents/{document_id}/analyze` - Activar análisis de documento
- `GET /api/v1/documents/{document_id}/extracted-data` - Obtener datos extraídos

### Pacientes
- `POST /api/v1/patients/` - Crear nuevo paciente
- `GET /api/v1/patients/` - Listar todos los pacientes
- `GET /api/v1/patients/{patient_id}` - Obtener paciente por ID
- `PUT /api/v1/patients/{patient_id}` - Actualizar paciente
- `POST /api/v1/patients/from-document/{document_id}` - Crear paciente desde documento

### Roles
- `GET /api/v1/roles/` - Listar todos los roles (solo admin)
- `GET /api/v1/roles/{role_id}` - Obtener rol por ID (solo admin)
- `POST /api/v1/roles/` - Crear nuevo rol (solo admin)
- `GET /api/v1/roles/resources/list` - Listar recursos y acciones disponibles

## Configuración e Instalación

1. Crear un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

3. Crear un archivo `.env` con las siguientes variables:
   ```
   MONGODB_URL=tu_url_mongodb
   JWT_SECRET_KEY=tu_jwt_secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. Ejecutar la aplicación:
   ```bash
   python run.py
   ```

## Base de Datos

La aplicación utiliza MongoDB como base de datos. La base de datos se inicializará automáticamente con roles predeterminados y un usuario administrador al primer inicio.

## Seguridad

- Autenticación basada en JWT
- Hash de contraseñas usando bcrypt
- Control de acceso basado en roles
- Manejo seguro de carga de archivos
- Configuración mediante variables de entorno

## Desarrollo

El proyecto sigue una estructura modular con clara separación de responsabilidades:
- Models: Validación y serialización de datos
- Core: Configuración y utilidades de la aplicación
- API: Manejadores de rutas y lógica de negocio
- Utils: Funciones de utilidad y código compartido

## Pruebas

Las pruebas se encuentran en el directorio `tests/`. Ejecutar pruebas usando:
```bash
pytest
``` 