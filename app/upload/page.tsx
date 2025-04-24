import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { PendingUploads } from "@/components/pending-uploads"

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Subir Archivos</h1>
        <p className="text-muted-foreground">Subir registros médicos de pacientes para su procesamiento</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Subir Registros Médicos</CardTitle>
            <CardDescription>Formatos soportados: PDF, JPEG, PNG (.pdf, .jpg, .jpeg, .png)</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Directrices de Carga</CardTitle>
            <CardDescription>Por favor, asegúrese de que todos los archivos cumplan con los siguientes requisitos</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Tamaño máximo de archivo: 50MB por archivo</li>
              <li>Los documentos deben ser legibles y no estar protegidos con contraseña</li>
              <li>La información del paciente debe ser claramente visible</li>
              <li>Cada archivo debe contener registros de un solo paciente</li>
              <li>No suba archivos que contengan imágenes médicas como radiografías o tomografías directamente</li>
              <li>Oculte o elimine cualquier información personal sensible no relevante para el tratamiento</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cargas Pendientes</CardTitle>
          <CardDescription>Archivos subidos y en espera de procesamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingUploads />
        </CardContent>
      </Card>
    </div>
  )
}

