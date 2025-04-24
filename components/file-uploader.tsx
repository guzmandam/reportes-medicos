"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import api from "@/lib/axios"

// Define upload status types
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

// Define file with status
export interface FileWithStatus {
  file: File
  status: UploadStatus
  progress: number
  error?: string
  uploadId?: string
}

export function FileUploader() {
  const { toast } = useToast()
  const { getToken } = useAuth()
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        status: 'idle' as UploadStatus,
        progress: 0
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (fileWithStatus: FileWithStatus, index: number) => {
    // Update status to uploading
    setFiles(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], status: 'uploading', progress: 0 }
      return updated
    })

    try {
      // Create form data with the file
      const formData = new FormData()
      formData.append('file', fileWithStatus.file)
            
      // Use the existing backend API endpoint
      const apiUrl = '/documents/test-upload-process'
      
      // Use the global API instance for the upload with progress tracking
      const response = await api.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            setFiles(prev => {
              const updated = [...prev]
              updated[index] = { ...updated[index], progress }
              return updated
            })
          }
        }
      })
      
      // Update status to success
      setFiles(prev => {
        const updated = [...prev]
        updated[index] = { 
          ...updated[index], 
          status: 'success', 
          progress: 100,
          uploadId: response.data.uploadId
        }
        return updated
      })
      
      toast({
        title: "Archivo subido con éxito",
        description: `${fileWithStatus.file.name} ha sido procesado correctamente.`,
      })
      
      return response.data
    } catch (error) {
      // Update status to error
      setFiles(prev => {
        const updated = [...prev]
        updated[index] = { 
          ...updated[index], 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
        return updated
      })
      
      toast({
        title: "Error al subir el archivo",
        description: `No se pudo subir ${fileWithStatus.file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
      
      throw error
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No hay archivos seleccionados",
        description: "Por favor, seleccione al menos un archivo para subir.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    
    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        if (files[i].status !== 'success') {
          await uploadFile(files[i], i)
        }
      }
      
      // Clear successfully uploaded files after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'success'))
      }, 3000)
      
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return null
    }
  }

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'success':
        return 'Completado'
      case 'error':
        return 'Error'
      case 'uploading':
        return 'Subiendo'
      default:
        return 'Pendiente'
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          files.length > 0 ? "border-border" : "border-primary/20"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Arrastre archivos aquí o haga clic para explorar</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Suba registros médicos en PDF, resultados de laboratorio u otros documentos de pacientes
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium">Archivos Seleccionados ({files.length})</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((fileWithStatus, index) => (
              <div
                key={`${fileWithStatus.file.name}-${index}`}
                className="flex flex-col bg-muted/50 rounded-md p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded flex items-center justify-center">
                      <span className="text-xs">{fileWithStatus.file.name.split(".").pop()?.toUpperCase()}</span>
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileWithStatus.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(fileWithStatus.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                    disabled={fileWithStatus.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {fileWithStatus.status !== 'idle' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs">
                        {getStatusIcon(fileWithStatus.status)}
                        <span>{getStatusText(fileWithStatus.status)}</span>
                        {fileWithStatus.error && (
                          <span className="text-red-500">: {fileWithStatus.error}</span>
                        )}
                      </div>
                      {fileWithStatus.status === 'uploading' && (
                        <span className="text-xs">{fileWithStatus.progress}%</span>
                      )}
                    </div>
                    <Progress value={fileWithStatus.progress} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button 
            className="w-full" 
            onClick={handleUpload} 
            disabled={uploading || files.every(f => f.status === 'success')}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </div>
      )}
    </div>
  )
}

