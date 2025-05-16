"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { samples } from "@/lib/sample-data"
import { useState } from "react"

interface SampleSelectorProps {
  onSelectSample: (sampleId: string) => void
  mode: string
}

export function SampleSelector({ onSelectSample, mode }: SampleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <FileText className="mr-1 h-3 w-3" />
        <span className="text-xs">Sample Data</span>
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <h3 className="text-sm font-medium mb-1">
              {mode === "compress" ? "Sample Text" : "Sample Data to Compress"}
            </h3>
            <div className="border-t my-1" />
            <div className="max-h-[300px] overflow-y-auto">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onSelectSample(sample.id)
                    setIsOpen(false)
                  }}
                >
                  <div>
                    <div className="font-medium">{sample.name}</div>
                    <div className="text-xs text-muted-foreground">{sample.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
