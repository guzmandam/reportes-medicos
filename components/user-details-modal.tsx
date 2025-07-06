"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Shield, User as UserIcon, Clock } from "lucide-react"
import { User } from "@/lib/users-api"

interface UserDetailsModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (user: User) => void
}

export function UserDetailsModal({ user, open, onOpenChange, onEdit }: UserDetailsModalProps) {
  if (!user) return null

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'doctor':
        return 'bg-blue-100 text-blue-800'
      case 'nurse':
        return 'bg-green-100 text-green-800'
      case 'user':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador con acceso completo al sistema'
      case 'doctor':
        return 'Médico con acceso a registros médicos y pacientes'
      case 'nurse':
        return 'Enfermero/a con acceso limitado a registros'
      case 'user':
        return 'Usuario estándar con permisos básicos'
      default:
        return 'Usuario del sistema'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
          <DialogDescription>
            Información completa del usuario seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" />
              <AvatarFallback className="text-lg">{getInitials(user.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.is_active ? "default" : "secondary"}>
              {user.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">ID de Usuario</p>
                <p className="text-sm text-muted-foreground">{user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Mail className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Shield className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Rol</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getRoleColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getRoleDescription(user.role)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Fecha de Creación</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            {onEdit && (
              <Button 
                className="flex-1"
                onClick={() => {
                  onEdit(user)
                  onOpenChange(false)
                }}
              >
                Editar Usuario
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 