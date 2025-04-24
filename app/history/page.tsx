import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileHistory } from "@/components/file-history"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Historial de Archivos</h1>
        <p className="text-muted-foreground">Ver y gestionar registros médicos previamente cargados</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline">Últimos 30 días</Button>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Informe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Cargas</CardTitle>
          <CardDescription>Todos los archivos cargados a la plataforma con estado de procesamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <FileHistory />
        </CardContent>
      </Card>
    </div>
  )
}

