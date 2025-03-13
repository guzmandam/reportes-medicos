# Medical Records Platform

A modern, secure, and user-friendly medical records management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 Secure authentication and role-based access control
- 👥 User management with different roles (admin, doctor, nurse)
- 📋 Patient records management
- 📅 Appointment scheduling
- 📊 Analytics and reporting
- 🌓 Light/Dark mode support
- 📱 Responsive design
- 🔒 Role-based permissions system

## Tech Stack

- **Framework**: Next.js 15.1.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Radix UI
  - Shadcn/ui
  - Hero Icons
- **State Management**: React Context
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Authentication**: Custom implementation with JWT

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd medical-records-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=your_api_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
medical-records-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/              # Static assets
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The application uses a custom authentication system with JWT tokens. Users can be assigned different roles:
- Admin: Full system access
- Doctor: Access to patient records and appointments
- Nurse: Limited access to patient records

## Role-Based Access Control

The system implements a comprehensive role-based access control (RBAC) system with the following resources:
- Users
- Patients
- Medical Records
- Appointments
- Analytics
- Settings

Each role can be assigned specific permissions for these resources.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [support contact information].

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/) 