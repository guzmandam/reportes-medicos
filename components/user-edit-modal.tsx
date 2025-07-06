"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, X } from "lucide-react"
import { User, UserUpdate, usersApi } from "@/lib/users-api"
import { useToast } from "@/hooks/use-toast"

interface UserEditModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: (updatedUser: User) => void
}

export function UserEditModal({ user, open, onOpenChange, onUserUpdated }: UserEditModalProps) {
  const [formData, setFormData] = useState<UserUpdate>({})
  const [loading, setLoading] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const { toast } = useToast()

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && open) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      })
      setShowPasswordField(false)
    }
  }, [user, open])

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (!formData.full_name?.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre completo es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!formData.email?.trim()) {
      toast({
        title: "Error de validación",
        description: "El email es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!formData.role) {
      toast({
        title: "Error de validación",
        description: "El rol es obligatorio.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      // Prepare update data
      const updateData: UserUpdate = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active
      }

      // Only include password if it was set
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim()
      }

      const updatedUser = await usersApi.updateUser(user.id, updateData)
      
      onUserUpdated(updatedUser)
      onOpenChange(false)
      
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente.",
      })
    } catch (err: any) {
      console.error('Error updating user:', err)
      toast({
        title: "Error al actualizar usuario",
        description: err?.response?.data?.detail || "No se pudo actualizar el usuario.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica la información del usuario seleccionado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="text-lg">
                {formData.full_name ? getInitials(formData.full_name) : getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nombre completo del usuario"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role || ''}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Enfermero/a</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Usuario Activo</Label>
              <Switch
                id="is_active"
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            {/* Password Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cambiar Contraseña</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordField(!showPasswordField)}
                >
                  {showPasswordField ? "Cancelar" : "Cambiar"}
                </Button>
              </div>
              
              {showPasswordField && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nueva contraseña"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deja en blanco si no quieres cambiar la contraseña
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button"
              variant="outline" 
              className="flex-1"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 