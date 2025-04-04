# Plataforma de Registros Médicos

Un sistema moderno, seguro y fácil de usar para la gestión de registros médicos, construido con Next.js, TypeScript y Tailwind CSS.

## Características

- 🔐 Autenticación segura y control de acceso basado en roles
- 👥 Gestión de usuarios con diferentes roles (administrador, médico, enfermero)
- 📋 Gestión de registros de pacientes
- 📅 Programación de citas
- 📊 Análisis y reportes
- 🌓 Soporte para modo claro/oscuro
- 📱 Diseño responsivo
- 🔒 Sistema de permisos basado en roles

## Stack Tecnológico

- **Framework**: Next.js 15.1.0
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: 
  - Radix UI
  - Shadcn/ui
  - Hero Icons
- **Gestión de Estado**: React Context
- **Manejo de Formularios**: React Hook Form con validación Zod
- **Cliente HTTP**: Axios
- **Manejo de Fechas**: date-fns
- **Gráficos**: Recharts
- **Notificaciones**: React Hot Toast
- **Autenticación**: Implementación personalizada con JWT

## Prerrequisitos

- Node.js 18.x o superior
- npm o yarn como gestor de paquetes

## Comenzando

1. Clonar el repositorio:
   ```bash
   git clone [url-del-repositorio]
   cd medical-records-platform
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env.local` en el directorio raíz con las siguientes variables:
   ```
   NEXT_PUBLIC_API_URL=tu_url_api
   ```

4. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
medical-records-platform/
├── app/                    # Directorio de la aplicación Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del panel de control
│   ├── api/               # Rutas de la API
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizables
├── contexts/             # Contextos de React
├── hooks/                # Hooks personalizados de React
├── lib/                  # Funciones y configuraciones de utilidad
├── public/              # Activos estáticos
├── styles/              # Estilos globales
└── types/               # Definiciones de tipos TypeScript
```

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Iniciar servidor de producción
- `npm run lint` - Ejecutar ESLint

## Autenticación

La aplicación utiliza un sistema de autenticación personalizado con tokens JWT. Los usuarios pueden ser asignados a diferentes roles:
- Administrador: Acceso completo al sistema
- Médico: Acceso a registros de pacientes y citas
- Enfermero: Acceso limitado a registros de pacientes

## Control de Acceso Basado en Roles

El sistema implementa un sistema completo de control de acceso basado en roles (RBAC) con los siguientes recursos:
- Usuarios
- Pacientes
- Registros Médicos
- Citas
- Análisis
- Configuraciones

Cada rol puede ser asignado permisos específicos para estos recursos.

## Contribuir

1. Hacer fork del repositorio
2. Crear tu rama de características (`git checkout -b feature/caracteristica-increible`)
3. Confirmar tus cambios (`git commit -m 'Agregar alguna característica increible'`)
4. Subir a la rama (`git push origin feature/caracteristica-increible`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Soporte

Para soporte, por favor contacta a [información de contacto de soporte].

## Agradecimientos

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/) 