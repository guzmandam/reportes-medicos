"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, FileDown, Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"

const fileHistory = [
  {
    id: "UP-123456",
    filename: "patient_records_089234.pdf",
    uploadedAt: "Apr 15, 2023",
    status: "Completed",
    fileSize: "8.2 MB",
    patientId: "P-45678",
    patientName: "Robert Johnson",
    processedAt: "Apr 15, 2023",
  },
  {
    id: "UP-123457",
    filename: "lab_results_2023_11_15.pdf",
    uploadedAt: "Apr 14, 2023",
    status: "Completed",
    fileSize: "4.7 MB",
    patientId: "P-34521",
    patientName: "Mary Williams",
    processedAt: "Apr 14, 2023",
  },
  {
    id: "UP-123458",
    filename: "ct_scan_report_08723.pdf",
    uploadedAt: "Apr 12, 2023",
    status: "Completed",
    fileSize: "12.3 MB",
    patientId: "P-78923",
    patientName: "James Martinez",
    processedAt: "Apr 12, 2023",
  },
  {
    id: "UP-123459",
    filename: "medical_history_complete.pdf",
    uploadedAt: "Apr 10, 2023",
    status: "Error",
    fileSize: "15.8 MB",
    patientId: "P-12345",
    patientName: "Sarah Chen",
    processedAt: "-",
  },
  {
    id: "UP-123460",
    filename: "prescription_records_2023.pdf",
    uploadedAt: "Apr 8, 2023",
    status: "Completed",
    fileSize: "2.3 MB",
    patientId: "P-67890",
    patientName: "Michael Brown",
    processedAt: "Apr 8, 2023",
  },
  {
    id: "UP-123461",
    filename: "allergy_test_results.pdf",
    uploadedAt: "Apr 5, 2023",
    status: "Completed",
    fileSize: "3.1 MB",
    patientId: "P-24680",
    patientName: "Jennifer Lee",
    processedAt: "Apr 5, 2023",
  },
  {
    id: "UP-123462",
    filename: "vaccination_history.pdf",
    uploadedAt: "Apr 2, 2023",
    status: "Completed",
    fileSize: "1.8 MB",
    patientId: "P-13579",
    patientName: "David Wilson",
    processedAt: "Apr 2, 2023",
  },
  {
    id: "UP-123463",
    filename: "annual_checkup_results.pdf",
    uploadedAt: "Mar 28, 2023",
    status: "Completed",
    fileSize: "5.4 MB",
    patientId: "P-97531",
    patientName: "Lisa Garcia",
    processedAt: "Mar 28, 2023",
  },
]

export function FileHistory() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFiles = fileHistory.filter(
    (file) =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.patientId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by filename, patient name or ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Process Date</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.filename}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{file.patientName}</div>
                    <div className="text-xs text-muted-foreground">{file.patientId}</div>
                  </div>
                </TableCell>
                <TableCell>{file.uploadedAt}</TableCell>
                <TableCell>{file.processedAt}</TableCell>
                <TableCell>{file.fileSize}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      file.status === "Completed" ? "default" : file.status === "Error" ? "destructive" : "outline"
                    }
                  >
                    {file.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <FileDown className="h-4 w-4" />
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <Pagination />
      </div>
    </div>
  )
}

