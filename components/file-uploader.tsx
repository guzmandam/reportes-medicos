"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

export function FileUploader() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setFiles([])
          toast({
            title: "Upload complete",
            description: `Successfully uploaded ${files.length} files.`,
          })
          return 0
        }
        return prev + 5
      })
    }, 300)
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          files.length > 0 ? "border-border" : "border-primary/20"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Drag files here or click to browse</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload PDF medical records, lab results, or other patient documents
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium">Selected Files ({files.length})</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-muted/50 rounded-md p-2"
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="flex-shrink-0 h-9 w-9 bg-primary/10 rounded flex items-center justify-center">
                    <span className="text-xs">{file.name.split(".").pop()?.toUpperCase()}</span>
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setFiles([])} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

