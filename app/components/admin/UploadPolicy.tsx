"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, FileUp, X } from "lucide-react"
import { policyService } from "../../services/api"

export default function UploadPolicy() {
  const [files, setFiles] = useState<File[]>([])
  const [discipline, setDiscipline] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for PDF files only
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf")
    setFiles(pdfFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  const removeFile = () => {
    setFiles([])
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({
        type: "error",
        message: "Please select a PDF file to upload.",
      })
      return
    }

    if (!discipline) {
      setUploadStatus({
        type: "error",
        message: "Please select a discipline.",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("discipline", discipline)

      const response = await policyService.uploadPolicy(formData)

      setUploadStatus({
        type: "success",
        message: `${files[0].name} has been successfully uploaded for ${discipline} discipline.`,
      })

      // Reset form after successful upload
      setFiles([])
      setDiscipline("")
    } catch (error: any) {
      setUploadStatus({
        type: "error",
        message: error.response?.data?.message || "An error occurred while uploading the file.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="discipline" className="text-base">
                Discipline
              </Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline" className="mt-1 border-secondary">
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Academic Honesty">Academic Honesty</SelectItem>
                  <SelectItem value="Inclusion">Inclusion</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                  <SelectItem value="Admission">Admissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base">Policy Document (PDF)</Label>
              <div
                {...getRootProps()}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer
                  ${isDragActive ? "border-primary bg-primary/5" : "border-secondary hover:border-primary"}
                  transition-colors duration-150`}
              >
                <input {...getInputProps()} />
                <div className="space-y-1 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">
                      {isDragActive ? "Drop the PDF file here" : "Drag and drop a PDF file here, or click to select"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                <div className="flex items-center">
                  <FileUp className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium truncate max-w-xs">{files[0].name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile} className="text-gray-500 hover:text-red-500">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {uploadStatus.type && (
              <Alert variant={uploadStatus.type === "error" ? "destructive" : "default"} className="mt-4">
                {uploadStatus.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <AlertDescription>{uploadStatus.message}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-primary hover:bg-primary/90">
              {isUploading ? "Uploading..." : "Upload Policy"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
