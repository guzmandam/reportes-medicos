import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileHistory } from "@/components/file-history"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">File History</h1>
        <p className="text-muted-foreground">View and manage previously uploaded medical records</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">Past 30 days</Button>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>All files uploaded to the platform with processing status</CardDescription>
        </CardHeader>
        <CardContent>
          <FileHistory />
        </CardContent>
      </Card>
    </div>
  )
}

