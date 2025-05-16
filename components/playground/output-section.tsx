"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, AlertCircle, Copy, Check, FileText, Share2 } from "lucide-react"
import { downloadOutputFile } from "@/lib/download-utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createShareableLink } from "@/lib/share-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OutputSectionProps {
  outputData: string
  inputData: string
  mode: string
  version: string
  result?: Uint8Array | null
  fileName?: string | null
  error?: string | null
  isBase64?: boolean
  setFileName?: (name: string | null) => void
  updateHistoryFilename?: (oldName: string | null, newName: string | null) => void
  lastProcessedTime?: number | null
}

export function OutputSection({
  outputData,
  inputData,
  mode,
  version,
  result,
  fileName,
  error,
  isBase64,
  setFileName,
  updateHistoryFilename,
  lastProcessedTime,
}: OutputSectionProps) {
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lastKnownFileName, setLastKnownFileName] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareableLink, setShareableLink] = useState<string | null>(null)
  const [isDataTooLarge, setIsDataTooLarge] = useState(false)

  // Track filename changes to update history
  useEffect(() => {
    if (fileName !== undefined) {
      setLastKnownFileName(fileName)
    }
  }, [fileName])

  const handleDownload = () => {
    if (result) {
      // If we have binary data, use it directly
      downloadOutputFile(result, fileName, mode)
    } else if (outputData) {
      // Otherwise convert the text to a Uint8Array
      const encoder = new TextEncoder()
      const data = encoder.encode(outputData)
      downloadOutputFile(data, fileName, mode)
    }
  }

  const handleCopy = async () => {
    if (outputData) {
      await navigator.clipboard.writeText(outputData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    if (inputData && outputData) {
      const { url, isDataTooLarge } = createShareableLink(
        inputData,
        mode,
        version,
        fileName,
        outputData,
        lastProcessedTime || undefined,
      )

      setShareableLink(url)
      setIsDataTooLarge(isDataTooLarge)
      setShareDialogOpen(true)
    }
  }

  const handleCopyLink = async () => {
    if (shareableLink) {
      await navigator.clipboard.writeText(shareableLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

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
    // We could implement file dropping here if needed
  }

  // Generate a default extension based on mode
  const getDefaultExtension = () => {
    return mode === "compress" ? ".txt" : ".lz4"
  }

  // Handle filename change
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFileName = e.target.value || null

    if (setFileName) {
      setFileName(newFileName)
    }

    // Update the filename in history if it has changed
    if (updateHistoryFilename && lastKnownFileName !== newFileName && lastProcessedTime) {
      updateHistoryFilename(lastKnownFileName, newFileName)
      setLastKnownFileName(newFileName)
    }
  }

  const hasOutput = outputData || result

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between -mb-0.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CardTitle>Output</CardTitle>
              {isBase64 && <Badge variant="outline">base64</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs"
              disabled={copied || error || !hasOutput}
            >
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative ${isDragging ? "border-2 border-dashed border-primary rounded-md" : ""}`}
        >
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Textarea
              className={`min-h-[200px] font-mono text-sm`}
              placeholder={`${mode === "compress" ? "Compressed" : "Decompressed"} output will appear here...`}
              value={outputData}
              readOnly
            />
          )}
          <div className="mt-6 flex items-center">
            <div className="relative flex-1">
              <Label htmlFor="output-filename" className="sr-only">
                Filename
              </Label>
              <div className="flex">
                <Input
                  id="output-filename"
                  value={fileName || ""}
                  onChange={handleFileNameChange}
                  placeholder={`untitled${getDefaultExtension()}`}
                  className="w-full pr-12"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="flex ml-2 gap-2">
              {hasOutput && !error && (
                <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1 py-px">
                  <Share2 className="h-4 w-4 mr-1" />
                  <span>Share</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1 py-px"
                disabled={!hasOutput}
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Compression Result</DialogTitle>
            <DialogDescription>
              {isDataTooLarge
                ? "Your data is too large to include in a shareable link. This link will only share the configuration, not the actual data."
                : "Anyone with this link can view your compression result."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" readOnly value={shareableLink || ""} className="font-mono text-xs" />
            </div>
            <Button size="sm" className="px-3" onClick={handleCopyLink}>
              <span className="sr-only">Copy</span>
              {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {isDataTooLarge && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Data Size Warning</AlertTitle>
              <AlertDescription>
                Your data is too large to include in a URL. Consider downloading the file and sharing it separately.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
