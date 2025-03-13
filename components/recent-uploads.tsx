"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const uploads = [
  {
    id: "1",
    filename: "patient_records_086532.pdf",
    uploadedBy: "Dr. Sarah Chen",
    status: "Completed",
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SC",
  },
  {
    id: "2",
    filename: "lab_results_A876522.pdf",
    uploadedBy: "Dr. Mark Johnson",
    status: "Processing",
    time: "3 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MJ",
  },
  {
    id: "3",
    filename: "xray_scan_10945.pdf",
    uploadedBy: "Dr. Lisa Williams",
    status: "Pending",
    time: "5 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "LW",
  },
  {
    id: "4",
    filename: "medical_history_7653.pdf",
    uploadedBy: "Dr. Robert Smith",
    status: "Completed",
    time: "Yesterday",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "RS",
  },
  {
    id: "5",
    filename: "ct_scan_results_08765.pdf",
    uploadedBy: "Dr. Emily Jones",
    status: "Error",
    time: "Yesterday",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "EJ",
  },
]

export function RecentUploads() {
  return (
    <div className="space-y-4">
      {uploads.map((upload) => (
        <div key={upload.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={upload.avatar} />
              <AvatarFallback>{upload.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{upload.filename}</p>
              <p className="text-sm text-muted-foreground">{upload.uploadedBy}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                upload.status === "Completed"
                  ? "default"
                  : upload.status === "Processing"
                    ? "secondary"
                    : upload.status === "Error"
                      ? "destructive"
                      : "outline"
              }
            >
              {upload.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{upload.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

