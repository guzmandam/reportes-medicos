'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "@/components/user-management"
import { Button } from "@/components/ui/button"
import { Download, UserPlus } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Resource, Action } from "@/lib/roles"

export default function UsersPage() {
  return (
    <ProtectedRoute
      requiredPermissions={[
        { resource: Resource.USERS, action: Action.READ },
        { resource: Resource.USERS, action: Action.MANAGE }
      ]}
    >
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Gestionar roles y permisos de usuarios</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex">
            <Button variant="outline">Todos los Usuarios</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Usuario
            </Button>
          </div>
        </div>

        <Card>
          <CardContent>
            <UserManagement />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

