"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, FileText, MoreHorizontal, Search, UserCog, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Patient } from "@/types/patient"

export function PatientList() {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Function to fetch patients from API
  const fetchPatients = async () => {
    setLoading(true)
    try {
      const response = await api.get('/patients/')
      setPatients(response.data)
    } catch (error: any) {
      console.error('Error fetching patients:', error)
      toast({
        title: "Error al cargar pacientes",
        description: error?.response?.data?.detail || "No se pudieron cargar los pacientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.names} ${patient.paternal_lastname} ${patient.maternal_lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.him.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to get full name
  const getFullName = (patient: Patient) => {
    return `${patient.names} ${patient.paternal_lastname} ${patient.maternal_lastname}`.trim()
  }

  // Helper function to get initials
  const getInitials = (patient: Patient) => {
    const names = patient.names.split(' ')
    const firstInitial = names[0]?.charAt(0) || ''
    const lastInitial = patient.paternal_lastname?.charAt(0) || ''
    return (firstInitial + lastInitial).toUpperCase()
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Helper function to calculate age
  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age
    } catch {
      return 'N/A'
    }
  }

  // Helper function to get gender badge variant
  const getGenderBadgeVariant = (gender: string) => {
    switch (gender) {
      case 'Masculino':
        return 'default'
      case 'Femenino':
        return 'secondary'
      case 'Otro':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Helper function to format time since created
  const getTimeSinceCreated = (createdAt: string) => {
    try {
      const created = new Date(createdAt)
      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return 'Hoy'
      } else if (diffInDays === 1) {
        return 'Ayer'
      } else if (diffInDays < 30) {
        return `Hace ${diffInDays} días`
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30)
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`
      } else {
        const years = Math.floor(diffInDays / 365)
        return `Hace ${years} año${years > 1 ? 's' : ''}`
      }
    } catch {
      return 'N/A'
    }
  }

  // Load patients on component mount
  useEffect(() => {
    fetchPatients()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o HIM..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchPatients} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      {patients.length === 0 && !loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay pacientes registrados aún</p>
          <p className="text-sm">Los pacientes aparecerán aquí cuando se procesen documentos</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>HIM</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Fecha Nacimiento</TableHead>
                <TableHead>Médicos</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Cargando pacientes...
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No se encontraron pacientes con esos criterios de búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(patient)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{getFullName(patient)}</div>
                          <div className="text-xs text-muted-foreground">ID: {patient.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {patient.him}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getGenderBadgeVariant(patient.gender)}>
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{calculateAge(patient.date_of_birth)} años</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(patient.date_of_birth)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {patient.doctors && patient.doctors.length > 0 ? (
                          <span>{patient.doctors.length} médico{patient.doctors.length > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-muted-foreground">Sin médicos</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {getTimeSinceCreated(patient.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/patients/${patient.id}`}>
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Ver Perfil</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar Información</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Ver Documentos</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && filteredPatients.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}

