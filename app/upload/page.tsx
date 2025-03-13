import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { PendingUploads } from "@/components/pending-uploads"

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Upload Files</h1>
        <p className="text-muted-foreground">Upload patient medical records for processing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upload Medical Records</CardTitle>
            <CardDescription>Supported formats: PDF, JPEG, PNG (.pdf, .jpg, .jpeg, .png)</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
            <CardDescription>Please ensure all files meet the following requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Maximum file size: 50MB per file</li>
              <li>Documents must be legible and not password protected</li>
              <li>Patient information must be clearly visible</li>
              <li>Each file should contain records for only one patient</li>
              <li>Do not upload files containing medical images such as X-rays or CT scans directly</li>
              <li>Redact or remove any sensitive personal information not relevant to treatment</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Uploads</CardTitle>
          <CardDescription>Files uploaded and waiting for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingUploads />
        </CardContent>
      </Card>
    </div>
  )
}

