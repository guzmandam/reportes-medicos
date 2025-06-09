import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { PendingUploads } from "@/components/pending-uploads"

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Subir Archivos</h1>
        <p className="text-muted-foreground">Subir registros médicos para procesamiento automático e extracción de datos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Subir Registros Médicos</CardTitle>
            <CardDescription>Procesamiento automático con extracción de datos médicos</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Procesamiento Automático</CardTitle>
            <CardDescription>El sistema extraerá automáticamente la siguiente información</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Información del paciente (nombres, apellidos, fecha de nacimiento, HIM)</li>
              <li>Datos del médico tratante y cédula profesional</li>
              <li>Signos vitales y mediciones clínicas</li>
              <li>Prescripciones médicas y medicamentos</li>
              <li>Órdenes dietéticas y recomendaciones nutricionales</li>
              <li>Notas médicas y observaciones clínicas</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos Subidos</CardTitle>
          <CardDescription>Archivos subidos y su estado de procesamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingUploads />
        </CardContent>
      </Card>
    </div>
  )
}

