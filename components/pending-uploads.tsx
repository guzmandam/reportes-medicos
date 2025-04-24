"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, FileText, Trash2, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { FileWithStatus } from "./file-uploader"

// Define the upload record type
export interface UploadRecord {
  id: string
  filename: string
  uploadedAt: string
  status: 'Queued' | 'Processing' | 'Analyzing' | 'Completed' | 'Failed'
  fileSize: string
  patientId?: string
  patientName?: string
  error?: string
}

// Mock data - replace with API call later
const mockUploads: UploadRecord[] = [
  {
    id: "UP-789456",
    filename: "patient_records_089234.pdf",
    uploadedAt: "2 hours ago",
    status: "Queued",
    fileSize: "8.2 MB",
    patientId: "P-45678",
    patientName: "Robert Johnson",
  },
  {
    id: "UP-789457",
    filename: "lab_results_2023_11_15.pdf",
    uploadedAt: "3 hours ago",
    status: "Processing",
    fileSize: "4.7 MB",
    patientId: "P-34521",
    patientName: "Mary Williams",
  },
  {
    id: "UP-789458",
    filename: "ct_scan_report_08723.pdf",
    uploadedAt: "4 hours ago",
    status: "Analyzing",
    fileSize: "12.3 MB",
    patientId: "P-78923",
    patientName: "James Martinez",
  },
  {
    id: "UP-789459",
    filename: "medical_history_complete.pdf",
    uploadedAt: "1 day ago",
    status: "Failed",
    fileSize: "15.8 MB",
    patientId: "P-12345",
    patientName: "Sarah Chen",
    error: "Formato de archivo no soportado"
  },
  {
    id: "UP-789460",
    filename: "prescription_records_2023.pdf",
    uploadedAt: "1 day ago",
    status: "Queued",
    fileSize: "2.3 MB",
    patientId: "P-67890",
    patientName: "Michael Brown",
  },
]

export function PendingUploads() {
  const { getToken } = useAuth()
  const [uploads, setUploads] = useState<UploadRecord[]>(mockUploads)
  const [loading, setLoading] = useState(false)
  const [recentUploads, setRecentUploads] = useState<FileWithStatus[]>([])

  // Function to fetch uploads from API
  const fetchUploads = async () => {
    setLoading(true)
    try {
      // Get auth token
      const token = await getToken()
      
      // Dummy API endpoint - replace with real endpoint later
      const apiUrl = '/api/uploads'
      
      // In a real implementation, this would be an API call
      // const response = await fetch(apiUrl, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      // const data = await response.json()
      // setUploads(data)
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the mock data with some random changes to simulate real-time updates
      setUploads(prev => {
        return prev.map(upload => {
          // Randomly change some statuses to simulate processing
          if (upload.status === 'Queued' && Math.random() > 0.7) {
            return { ...upload, status: 'Processing' }
          } else if (upload.status === 'Processing' && Math.random() > 0.7) {
            return { ...upload, status: 'Analyzing' }
          } else if (upload.status === 'Analyzing' && Math.random() > 0.7) {
            return { ...upload, status: 'Completed' }
          }
          return upload
        })
      })
    } catch (error) {
      console.error('Error fetching uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to view upload details
  const viewUpload = (id: string) => {
    // In a real implementation, this would navigate to a details page
    console.log('Viewing upload:', id)
  }

  // Function to delete an upload
  const deleteUpload = async (id: string) => {
    try {
      // Get auth token
      const token = await getToken()
      
      // Dummy API endpoint - replace with real endpoint later
      const apiUrl = `/api/uploads/${id}`
      
      // In a real implementation, this would be an API call
      // await fetch(apiUrl, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      
      // For now, we'll just remove it from the state
      setUploads(prev => prev.filter(upload => upload.id !== id))
    } catch (error) {
      console.error('Error deleting upload:', error)
    }
  }

  // Function to get badge variant based on status
  const getBadgeVariant = (status: UploadRecord['status']) => {
    switch (status) {
      case 'Queued':
        return 'outline'
      case 'Processing':
      case 'Analyzing':
        return 'secondary'
      case 'Completed':
        return 'default'
      case 'Failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Function to get status text in Spanish
  const getStatusText = (status: UploadRecord['status']) => {
    switch (status) {
      case 'Queued':
        return 'En Cola'
      case 'Processing':
        return 'Procesando'
      case 'Analyzing':
        return 'Analizando'
      case 'Completed':
        return 'Completado'
      case 'Failed':
        return 'Fallido'
      default:
        return status
    }
  }

  // Refresh uploads periodically
  useEffect(() => {
    // Initial fetch
    fetchUploads()
    
    // Set up interval for periodic refresh
    const interval = setInterval(fetchUploads, 30000) // Refresh every 30 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Cargas Recientes</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchUploads} 
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Archivo</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Subido</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No hay cargas pendientes
              </TableCell>
            </TableRow>
          ) : (
            uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{upload.filename}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {upload.patientName ? (
                    <div>
                      <div className="font-medium">{upload.patientName}</div>
                      {upload.patientId && (
                        <div className="text-xs text-muted-foreground">{upload.patientId}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No asignado</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                    <span>{upload.uploadedAt}</span>
                  </div>
                </TableCell>
                <TableCell>{upload.fileSize}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(upload.status)}>
                    {getStatusText(upload.status)}
                  </Badge>
                  {upload.error && (
                    <div className="text-xs text-red-500 mt-1">{upload.error}</div>
                  )}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

