"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, CheckCircle, AlertCircle, FileText } from "lucide-react"
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
      // Create form data with just the file
      const formData = new FormData()
      formData.append('file', fileWithStatus.file)
            
      // Use the upload endpoint
      const apiUrl = '/documents/upload'
      
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
          uploadId: response.data.id
        }
        return updated
      })
      
      toast({
        title: "Archivo subido con éxito",
        description: `${fileWithStatus.file.name} ha sido procesado correctamente. Los datos se están extrayendo automáticamente.`,
      })
      
      return response.data
    } catch (error: any) {
      // Update status to error
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error desconocido'
      setFiles(prev => {
        const updated = [...prev]
        updated[index] = { 
          ...updated[index], 
          status: 'error', 
          error: errorMessage
        }
        return updated
      })
      
      toast({
        title: "Error al subir el archivo",
        description: `No se pudo subir ${fileWithStatus.file.name}: ${errorMessage}`,
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
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          files.length > 0 ? "border-border" : "border-primary/20 hover:border-primary/40"
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
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Arrastre archivos aquí o haga clic para explorar</h3>
          <p className="text-muted-foreground mb-2">
            Suba registros médicos para procesamiento automático
          </p>
          <p className="text-sm text-muted-foreground">
            Formatos soportados: PDF, JPEG, PNG (.pdf, .jpg, .jpeg, .png)
          </p>
        </label>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Procesamiento Automático</h4>
            <p className="text-sm text-blue-700 mt-1">
              Los archivos se procesarán automáticamente para extraer información del paciente, datos médicos, 
              prescripciones y otra información relevante. No necesita ingresar metadatos manualmente.
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Archivos Seleccionados ({files.length})</div>
            <Button 
              className="h-9" 
              onClick={handleUpload} 
              disabled={uploading || files.every(f => f.status === 'success')}
            >
              {uploading ? 'Subiendo...' : 'Subir Archivos'}
            </Button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((fileWithStatus, index) => (
              <div
                key={`${fileWithStatus.file.name}-${index}`}
                className="flex items-center justify-between bg-muted/50 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {fileWithStatus.file.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileWithStatus.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(fileWithStatus.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {fileWithStatus.status !== 'idle' && (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(fileWithStatus.status)}
                      <span className="text-xs font-medium">{getStatusText(fileWithStatus.status)}</span>
                      {fileWithStatus.status === 'uploading' && (
                        <span className="text-xs text-muted-foreground">{fileWithStatus.progress}%</span>
                      )}
                    </div>
                  )}
                  
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
              </div>
            ))}
          </div>
          
          {/* Progress bars for uploading files */}
          {files.some(f => f.status === 'uploading' || f.status === 'error') && (
            <div className="space-y-2">
              {files.map((fileWithStatus, index) => {
                if (fileWithStatus.status === 'uploading' || fileWithStatus.status === 'error') {
                  return (
                    <div key={`progress-${index}`} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate max-w-[200px]">{fileWithStatus.file.name}</span>
                        {fileWithStatus.error && (
                          <span className="text-red-500">{fileWithStatus.error}</span>
                        )}
                      </div>
                      <Progress value={fileWithStatus.progress} className="h-2" />
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

