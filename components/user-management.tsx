"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Key, Lock, MoreHorizontal, Search, Shield, Trash2, UserPlus, Loader2, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { usersApi, User } from "@/lib/users-api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDetailsModal } from "@/components/user-details-modal"
import { UserEditModal } from "@/components/user-edit-modal"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedUsers = await usersApi.getUsers()
      setUsers(fetchedUsers)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err?.response?.data?.detail || err?.message || 'Error desconocido')
      toast({
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los usuarios. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper functions
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
        month: 'short',
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

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ))
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setActionLoading(userId)
      await usersApi.deleteUser(userId)
      setUsers(users.filter(user => user.id !== userId))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      })
    } catch (err: any) {
      console.error('Error deleting user:', err)
      toast({
        title: "Error al eliminar usuario",
        description: err?.response?.data?.detail || "No se pudo eliminar el usuario.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId)
      const updatedUser = await usersApi.updateUser(userId, { is_active: !currentStatus })
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ))
      toast({
        title: "Estado actualizado",
        description: `El usuario ha sido ${updatedUser.is_active ? 'activado' : 'desactivado'} exitosamente.`,
      })
    } catch (err: any) {
      console.error('Error updating user status:', err)
      toast({
        title: "Error al actualizar estado",
        description: err?.response?.data?.detail || "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error al cargar usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No se pudieron cargar los usuarios. Por favor, revisa tu conexión e intenta nuevamente.
          </p>
          <Button onClick={fetchUsers}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, email o rol..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(user.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver Detalles</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar Usuario</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.is_active)}>
                        {user.is_active ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Desactivar Cuenta</span>
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Activar Cuenta</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar Usuario</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* TODO: Add pagination when needed */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios disponibles.'}
          </p>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onEdit={handleEditUser}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUser}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}

