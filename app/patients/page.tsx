import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientList } from "@/components/patient-list"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Upload } from "lucide-react"

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Patients</h1>
        <p className="text-muted-foreground">View and manage patient records</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">All Patients</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>View, edit and manage patient information</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientList />
        </CardContent>
      </Card>
    </div>
  )
}

