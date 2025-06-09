import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientList } from "@/components/patient/patient-list"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Upload } from "lucide-react"

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Pacientes</h1>
        <p className="text-muted-foreground">Ver y gestionar registros de pacientes</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline">Todos los Pacientes</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Paciente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Pacientes</CardTitle>
          <CardDescription>Ver, editar y gestionar información de pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientList />
        </CardContent>
      </Card>
    </div>
  )
}

