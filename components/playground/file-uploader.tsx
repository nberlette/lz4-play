"use client"

import type React from "react"

import { forwardRef, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onFileUpload: (file: File | null) => void
  uploadedFile: File | null
}

export const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(({ onFileUpload, uploadedFile }, ref) => {
  const [isDragging, setIsDragging] = useState(false)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Only update if the file has changed
      if (!uploadedFile || uploadedFile.name !== e.target.files[0].name) {
        onFileUpload(e.target.files[0])
      }
    }
  }

  const removeFile = () => {
    if (!uploadedFile) return // Don't trigger updates if already null

    onFileUpload(null)
    if (ref && "current" in ref && ref.current) {
      ref.current.value = ""
    }
  }

  return (
    <>
      <input type="file" className="hidden" onChange={handleFileChange} ref={ref} />

      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed ${isDragging ? "border-primary" : "border-muted"} hover:border-primary transition-colors cursor-pointer`}
          onClick={() => {
            if (ref && "current" in ref && ref.current) {
              ref.current.click()
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          ref={dropAreaRef}
        >
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">Drag and drop a file here or click to browse</p>
            <p className="text-xs text-muted-foreground">Support for text files, binary files, and more</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-muted">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <File className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
})

FileUploader.displayName = "FileUploader"
