"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import {
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"

const routes = [
  {
    path: "/",
    name: "Panel de Control",
    icon: HomeIcon,
    allowedRoles: ['admin', 'doctor', 'nurse', 'receptionist', 'user']
  },
  {
    path: "/patients",
    name: "Pacientes",
    icon: FolderIcon,
    allowedRoles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    path: "/history",
    name: "Historial",
    icon: ChartBarIcon,
    allowedRoles: ['admin', 'doctor', 'nurse', 'receptionist', 'user']
  },
  {
    path: "/users",
    name: "Usuarios",
    icon: UsersIcon,
    allowedRoles: ['admin']
  },
  {
    path: "/roles",
    name: "Roles",
    icon: UserGroupIcon,
    allowedRoles: ['admin']
  },
  {
    path: "/settings",
    name: "Configuración",
    icon: Cog6ToothIcon,
    allowedRoles: ['admin']
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Don't render sidebar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  if (!user) return null

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Registros Médicos</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {routes.map((route) => {
            if (!route.allowedRoles.includes(user.role)) return null

            const Icon = route.icon
            return (
              <Link key={route.path} href={route.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === route.path && "bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {route.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="space-y-4">
          <div className="text-sm">
            <div className="font-medium">{user.full_name}</div>
            <div className="text-gray-500">{user.role}</div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={logout}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

