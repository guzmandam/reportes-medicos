"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RecentUploadsProps {
  data?: Array<{
    id: string
    filename: string
    uploadedBy: string
    status: string
    time: string
    avatar: string
    initials: string
  }>
}

// Fallback data for when no data is provided
const fallbackUploads = [
  {
    id: "1",
    filename: "Sin cargas recientes",
    uploadedBy: "Sistema",
    status: "Info",
    time: "N/A",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SY",
  },
]

export function RecentUploads({ data = fallbackUploads }: RecentUploadsProps) {
  const uploads = data.length > 0 ? data : fallbackUploads
  
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
                upload.status === "Completed" || upload.status === "Analyzed"
                  ? "default"
                  : upload.status === "Processing"
                    ? "secondary"
                    : upload.status === "Error" || upload.status === "Failed"
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

