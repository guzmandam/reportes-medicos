"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, FileText, Trash2 } from "lucide-react"

const pendingUploads = [
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
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingUploads.map((upload) => (
            <TableRow key={upload.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">{upload.filename}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{upload.patientName}</div>
                  <div className="text-xs text-muted-foreground">{upload.patientId}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>{upload.uploadedAt}</span>
                </div>
              </TableCell>
              <TableCell>{upload.fileSize}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    upload.status === "Queued"
                      ? "outline"
                      : upload.status === "Processing" || upload.status === "Analyzing"
                        ? "secondary"
                        : upload.status === "Failed"
                          ? "destructive"
                          : "default"
                  }
                >
                  {upload.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

