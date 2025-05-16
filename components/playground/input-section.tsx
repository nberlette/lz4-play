"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/playground/file-uploader"
import { ArrowDownUp, RefreshCw, Upload } from "lucide-react"
import { SampleSelector } from "@/components/playground/sample-selector"

interface InputSectionProps {
  inputData: string
  setInputData: (data: string) => void
  inputType: string
  setInputType: (type: string) => void
  uploadedFile: File | null
  handleFileUpload: (file: File | null) => void
  handleSampleData: (sampleId: string) => void
  mode: string
  toggleMode: () => void
  packageVersion: string
  setPackageVersion: (version: string) => void
  availableVersions: Array<{ version: string; latest?: boolean }>
  isLoadingVersions: boolean
  refreshVersions: () => Promise<void>
  handleProcess: () => Promise<void>
  isProcessing: boolean
  isBase64?: boolean
}

export function InputSection({
  inputData,
  setInputData,
  inputType,
  setInputType,
  uploadedFile,
  handleFileUpload,
  handleSampleData,
  mode,
  toggleMode,
  packageVersion,
  setPackageVersion,
  availableVersions,
  isLoadingVersions,
  refreshVersions,
  handleProcess,
  isProcessing,
  isBase64,
}: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
      // Auto-switch to file mode
      setInputType("file")
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <Card className="h-full">
      <Tabs value={inputType} onValueChange={setInputType}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <SampleSelector onSelectSample={handleSampleData} mode={mode} />
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMode}
                title={`Switch to ${mode === "compress" ? "decompress" : "compress"} mode`}
              >
                <ArrowDownUp className="h-3 w-3" />
                <span className="sr-only">{mode} Mode</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${isDragging ? "border-2 border-dashed border-primary rounded-md" : ""} pt-4`}
        >
          <TabsContent value="file" className="mt-0">
            <FileUploader onFileUpload={handleFileUpload} ref={fileInputRef} uploadedFile={uploadedFile} />
          </TabsContent>
          <TabsContent value="text" className="mt-0 space-y-4">
            <Textarea
              placeholder={`Enter text to ${mode}...${mode === "decompress" ? " (base64-encoded if compressed data)" : ""}`}
              className={"min-h-[200px] font-mono text-sm"}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-md">
                <div className="text-center p-4 bg-background rounded-lg shadow-lg">
                  <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="font-medium">Drop file here</p>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
        <CardFooter className="flex justify-between space-x-4">
          <div className="flex justify-between space-x-2">
            <div className="relative">
              <Select value={packageVersion} onValueChange={setPackageVersion} disabled={isLoadingVersions}>
                <SelectTrigger className="min-w-[120px]">
                  <SelectValue placeholder="Version" />
                </SelectTrigger>
                <SelectContent>
                  {availableVersions.map((v) => (
                    <SelectItem key={v.version} value={v.version}>
                      <span className={`${v.latest ? "font-semibold" : "font-medium"}`}>{v.version}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-full absolute -right-12 top-0"
                onClick={refreshVersions}
                disabled={isLoadingVersions}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVersions ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={isProcessing || (!inputData && !uploadedFile)}>
            {isProcessing ? "Processing..." : mode === "compress" ? "Compress" : "Decompress"}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  )
}
