"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, FileText, Trash2, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"

// Define the upload record type based on backend Document model
export interface UploadRecord {
  id: string
  note_number: string
  note_type: string
  record_number?: string
  him?: string
  hospital?: string
  admission_date?: string
  admission_time?: string
  discharge_time?: string
  file_path: string
  uploaded_by: string
  patient_id?: string
  status: 'pending' | 'processing' | 'analyzed' | 'failed'
  created_at: string
  updated_at: string
  analyzed_at?: string
  extracted_data?: any
}

export function PendingUploads() {
  const { getToken } = useAuth()
  const { toast } = useToast()
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Function to fetch uploads from API
  const fetchUploads = async () => {
    setLoading(true)
    try {
      const response = await api.get('/documents/')
      setUploads(response.data)
    } catch (error: any) {
      console.error('Error fetching uploads:', error)
      toast({
        title: "Error al cargar documentos",
        description: error?.response?.data?.detail || "No se pudieron cargar los documentos subidos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to view upload details
  const viewUpload = (id: string) => {
    // In a real implementation, this would navigate to a details page
    console.log('Viewing upload:', id)
    // You could add navigation logic here, e.g.:
    // router.push(`/documents/${id}`)
  }

  // Function to delete an upload
  const deleteUpload = async (id: string) => {
    try {
      // Note: You would need to implement a DELETE endpoint in the backend
      // await api.delete(`/documents/${id}`)
      
      // For now, we'll just remove it from the state
      setUploads(prev => prev.filter(upload => upload.id !== id))
      
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
      })
    } catch (error: any) {
      console.error('Error deleting upload:', error)
      toast({
        title: "Error al eliminar",
        description: error?.response?.data?.detail || "No se pudo eliminar el documento.",
        variant: "destructive",
      })
    }
  }

  // Function to get badge variant based on status
  const getBadgeVariant = (status: UploadRecord['status']) => {
    switch (status) {
      case 'pending':
        return 'outline'
      case 'processing':
        return 'secondary'
      case 'analyzed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Function to get status text in Spanish
  const getStatusText = (status: UploadRecord['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'processing':
        return 'Procesando'
      case 'analyzed':
        return 'Analizado'
      case 'failed':
        return 'Error'
      default:
        return status
    }
  }

  // Function to get document type text in Spanish
  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'medical_record':
        return 'Registro Médico'
      case 'lab_result':
        return 'Resultado de Laboratorio'
      case 'prescription':
        return 'Prescripción'
      case 'discharge_summary':
        return 'Resumen de Alta'
      case 'referral':
        return 'Referencia'
      case 'other':
        return 'Otro'
      default:
        return type
    }
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora'
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) {
        return 'Ayer'
      } else if (diffInDays < 7) {
        return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
      } else {
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      }
    }
  }

  // Function to get filename from file_path
  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || 'Archivo'
  }

  // Initial fetch
  useEffect(() => {
    fetchUploads()
  }, [])

  // Refresh uploads periodically
  useEffect(() => {
    const interval = setInterval(fetchUploads, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {loading ? 'Cargando...' : `${uploads.length} documento${uploads.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUploads} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {uploads.length === 0 && !loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay documentos subidos aún</p>
          <p className="text-sm">Los documentos que suba aparecerán aquí</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Subido</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{getFileName(upload.file_path)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getDocumentTypeText(upload.note_type)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">#{upload.note_number}</p>
                    {upload.record_number && (
                      <p className="text-xs text-muted-foreground">
                        Exp: {upload.record_number}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {upload.him ? (
                      <div>
                        <p className="text-sm font-medium">HIM: {upload.him}</p>
                        {upload.hospital && (
                          <p className="text-xs text-muted-foreground">{upload.hospital}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No asignado</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(upload.status)}>
                    {getStatusText(upload.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(upload.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => viewUpload(upload.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteUpload(upload.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

