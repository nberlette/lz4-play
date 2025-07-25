"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { InputSection } from "@/components/playground/input-section"
import { OutputSection } from "@/components/playground/output-section"
import { MetricsDisplay } from "@/components/playground/metrics-display"
import { Footer } from "@/components/playground/footer"
import { fetchVersions } from "@/lib/version-fetcher"
import run from "@/lib/lz4"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { CompressionHistory, ProcessingConfig, PerformanceMetrics } from "@/lib/types"
import { encodeBase64, decodeBase64 } from "@/lib/binary-utils"
import { getSampleById } from "@/lib/sample-data"
import { parseShareableLink } from "@/lib/share-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function Playground() {
  // Get search params for shareable links - moved to useEffect to avoid the Suspense error
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  // State for versions
  const [availableVersions, setAvailableVersions] = useState([])
  const [isLoadingVersions, setIsLoadingVersions] = useState(true)

  // State for input/output
  const [inputData, setInputData] = useState("")
  const [outputData, setOutputData] = useState("")
  const [outputBinary, setOutputBinary] = useState<Uint8Array | null>(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [inputType, setInputType] = useState("text")
  const [fileName, setFileName] = useState<string | null>(null)
  const [isBase64, setIsBase64] = useState(false)

  // State for processing
  const [isProcessing, setIsProcessing] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [mode, setMode] = useState("compress")
  const [error, setError] = useState<string | null>(null)
  const [lastProcessedTime, setLastProcessedTime] = useState<number | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)

  // Configuration state - simplified to just version
  const [config, setConfig] = useState<ProcessingConfig>({
    version: "",
  })

  // History state with localStorage persistence - no limit on entries
  const [compressionHistory, setCompressionHistory] = useLocalStorage<CompressionHistory[]>(
    "lz4-compression-history",
    [],
  )

  // Persist metrics in localStorage
  const [persistedMetrics, setPersistedMetrics] = useLocalStorage<PerformanceMetrics | null>("lz4-last-metrics", null)

  // Use persisted metrics if no current metrics
  useEffect(() => {
    if (!metrics && persistedMetrics) {
      setMetrics(persistedMetrics)
    }
  }, [metrics, persistedMetrics])

  // Get search params safely on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  // Fetch available versions on component mount
  useEffect(() => {
    const getVersions = async () => {
      setIsLoadingVersions(true)
      try {
        const versions = await fetchVersions()
        setAvailableVersions(versions)
        // Set default version to latest
        if (versions.length > 0) {
          setConfig({ version: versions[0].version })
        }
      } catch (error) {
        console.error("Failed to fetch versions:", error)
      } finally {
        setIsLoadingVersions(false)
      }
    }

    getVersions()
  }, [])

  // Handle shareable links
  useEffect(() => {
    const handleShareableLink = async () => {
      if (!searchParams) return

      const stateParam = searchParams.get("state")
      if (!stateParam) return

      try {
        // Parse the state from the URL
        const {
          inputData: sharedInputData,
          mode: sharedMode,
          version: sharedVersion,
          fileName: sharedFileName,
          outputData: sharedOutputData,
          timestamp: sharedTimestamp,
          isDataMissing,
        } = parseShareableLink(window.location.href)

        // If data is missing, show an error
        if (isDataMissing) {
          setShareError("This shared link doesn't include the actual data, only the configuration.")
          return
        }

        // Update the state with the shared data
        if (sharedInputData) setInputData(sharedInputData)
        if (sharedMode) setMode(sharedMode)
        if (sharedVersion) setConfig({ version: sharedVersion })
        if (sharedFileName) setFileName(sharedFileName)
        if (sharedOutputData) setOutputData(sharedOutputData)
        if (sharedTimestamp) setLastProcessedTime(sharedTimestamp)

        // Set input type to text
        setInputType("text")
        setUploadedFile(null)

        // If we have output data, set isBase64 based on mode
        if (sharedOutputData) {
          setIsBase64(sharedMode === "compress")
        }

        // If we have all the necessary data, we can try to process it
        if (sharedInputData && sharedVersion && !sharedOutputData) {
          // Process the data
          await handleProcess(sharedInputData, sharedMode, sharedVersion, sharedFileName)
        }
      } catch (error) {
        console.error("Error handling shareable link:", error)
        setShareError("Failed to load the shared compression data. The link might be invalid or corrupted.")
      }
    }

    if (searchParams && searchParams.has("state")) {
      handleShareableLink()
    }
  }, [searchParams])

  const handleFileUpload = (file) => {
    if (file === uploadedFile) return // Prevent unnecessary updates
    setInputType(file ? "file" : "text")
    if (file) {
      setUploadedFile(file)
      setFileName(file.name)

      // Read file content for preview
      file.text().then(setInputData)
      setIsBase64(false)
    } else {
      setUploadedFile(null)
      setFileName(null)
      setInputData("")
      setIsBase64(false)
    }
  }

  // Function to update filename in history
  const updateHistoryFilename = (oldName: string | null, newName: string | null) => {
    if (oldName === newName) return

    setCompressionHistory((prevHistory) => {
      // Find the most recent entry with the matching filename and timestamp
      const updatedHistory = [...prevHistory]

      // If we have a lastProcessedTime, use that to find the exact entry
      if (lastProcessedTime) {
        const index = updatedHistory.findIndex((item) => item.timestamp === lastProcessedTime)
        if (index !== -1) {
          updatedHistory[index] = {
            ...updatedHistory[index],
            fileName: newName,
          }
        }
      } else {
        // Fallback: update the most recent entry with the matching filename
        const index = updatedHistory.findIndex((item) => item.fileName === oldName)
        if (index !== -1) {
          updatedHistory[index] = {
            ...updatedHistory[index],
            fileName: newName,
          }
        }
      }

      return updatedHistory
    })
  }

  const handleProcess = async (
    customInputData?: string,
    customMode?: string,
    customVersion?: string,
    customFileName?: string | null,
  ) => {
    setIsProcessing(true)
    setMetrics(null)
    setOutputBinary(null)
    setError(null)
    setShareError(null)

    try {
      let data: Uint8Array
      let originalSize: number

      // Use custom values if provided, otherwise use state values
      const currentInputData = customInputData || inputData
      const currentMode = customMode || mode
      const currentVersion = customVersion || config.version

      // Determine the filename to use
      let currentFileName: string

      if (customFileName) {
        currentFileName = customFileName
      } else if (inputType === "file" && uploadedFile) {
        // For file uploads, use the file's name
        currentFileName = uploadedFile.name
      } else {
        // For text input, use the custom filename or a default
        if (fileName && fileName.trim() !== "") {
          currentFileName = fileName
        } else {
          // Generate a default filename based on mode
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          currentFileName = currentMode === "compress" ? `untitled-${timestamp}.txt` : `compressed-${timestamp}.lz4`
        }
      }

      if (inputType === "file" && uploadedFile) {
        // Read file as ArrayBuffer
        const arrayBuffer = await uploadedFile.arrayBuffer()
        data = new Uint8Array(arrayBuffer)
        originalSize = data.length
      } else {
        // For text input, we need to determine if it's base64 or not
        // Check if we're in decompress mode and the data looks like base64
        const shouldTreatAsBase64 = currentMode === "decompress" && isBase64

        if (shouldTreatAsBase64) {
          // If we're decompressing and the input is marked as base64, decode it first
          try {
            data = decodeBase64(currentInputData)
            originalSize = data.length
          } catch (e) {
            throw new Error("Invalid base64 data. Please provide valid base64-encoded compressed data.")
          }
        } else {
          // Convert text to Uint8Array
          const encoder = new TextEncoder()
          data = encoder.encode(currentInputData)
          originalSize = data.length
        }
      }

      const cfg = { mode: currentMode, version: currentVersion }
      const response = await run(data, cfg)
      const { result, version, metrics: newMetrics } = response

      // Ensure duration is never 0 to avoid Infinity in speed calculations
      if (newMetrics.duration === 0) {
        newMetrics.duration = MIN_DURATION_MS; // Set minimum duration
      }

      // Recalculate speed with the corrected duration
      const dataSizeMB = newMetrics.originalSize / (1024 * 1024)
      newMetrics.speed = dataSizeMB / (newMetrics.duration / 1000)

      // Ensure speed is finite and reasonable
      if (!isFinite(newMetrics.speed) || newMetrics.speed > MAX_SPEED_CAP_MBPS) {
        newMetrics.speed = 0
      }

      // Store the binary result for download
      setOutputBinary(result.slice())

      // Update filename based on mode if needed
      if (currentMode === "compress" && !currentFileName.endsWith(".lz4")) {
        currentFileName = `${currentFileName}.lz4`
      } else if (currentMode === "decompress" && currentFileName.endsWith(".lz4")) {
        currentFileName = currentFileName.slice(0, -4)
      }

      // Update the filename state
      setFileName(currentFileName)

      // For compressed data, show base64 representation
      if (currentMode === "compress") {
        const base64Result = encodeBase64(result)
        setOutputData(base64Result)
        // Don't modify the input isBase64 state here - only set output state if needed
      } else {
        // For decompressed data, try to show as text if possible
        try {
          const decoder = new TextDecoder("utf-8", { fatal: true })
          const textResult = decoder.decode(result)
          setOutputData(textResult)
          // Don't modify the input isBase64 state here
        } catch (e) {
          // If decoding fails, show as base64
          const base64Result = encodeBase64(result)
          setOutputData(base64Result)
          // Don't modify the input isBase64 state here
        }
      }

      // Save result to history - no limit on entries
      const timestamp = Date.now()
      setLastProcessedTime(timestamp) // Store the timestamp for later reference

      const compressionResult: CompressionHistory = {
        timestamp,
        mode: currentMode,
        version,
        fileName: currentFileName,
        ...newMetrics,
      }

      // Add to history without limiting the number of entries
      setCompressionHistory((prev) => [compressionResult, ...prev])

      // Update and persist metrics
      setMetrics(newMetrics)
      setPersistedMetrics(newMetrics)
    } catch (error) {
      console.error("Processing error:", error)
      setError(error.message || "An unknown error occurred")
      setOutputData("")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle sample data selection with on-the-fly compression
  const handleSampleData = async (sampleId: string) => {
    const sample = getSampleById(sampleId)
    if (!sample) return

    // Set the filename from the sample
    setFileName(sample.fileName)

    if (mode === "compress") {
      // In compress mode, just load the raw sample
      setInputData(sample.data)
      setInputType("text")
      setUploadedFile(null)
      setIsBase64(false)
    } else {
      // In decompress mode, compress the sample on the fly
      try {
        setIsProcessing(true)

        // Convert sample text to Uint8Array
        const encoder = new TextEncoder()
        const data = encoder.encode(sample.data)

        // Compress the data using the current version
        const response = await run(data, { mode: "compress", version: config.version })

        // Convert the compressed data to base64
        const base64Result = encodeBase64(response.result)

        // Update the input with the compressed data
        setInputData(base64Result)
        setInputType("text")
        setUploadedFile(null)
        setIsBase64(true)

        // Update filename to add .lz4 extension if it doesn't already have it
        if (!sample.fileName.endsWith(".lz4")) {
          setFileName(`${sample.fileName}.lz4`)
        }
      } catch (error) {
        console.error("Error compressing sample:", error)
        // If compression fails, just load the raw sample
        setInputData(sample.data)
        setInputType("text")
        setUploadedFile(null)
        setIsBase64(false)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const toggleMode = () => {
    const newMode = mode === "compress" ? "decompress" : "compress"
    setMode(newMode)
    // Clear previous results when switching modes
    setOutputData("")
    setOutputBinary(null)
    setError(null)
    setLastProcessedTime(null)

    // When switching to decompress mode, if we have compressed output data,
    // move it to input and mark it as base64
    if (newMode === "decompress" && outputData && mode === "compress") {
      setInputData(outputData)
      setIsBase64(true)
      setInputType("text")
      setUploadedFile(null)
    } else if (newMode === "compress") {
      // When switching to compress mode, clear the base64 flag
      setIsBase64(false)
    }

    // Update filename extension based on the new mode
    if (fileName) {
      if (newMode === "compress" && fileName.endsWith(".lz4")) {
        setFileName(fileName.slice(0, -4))
      } else if (newMode === "decompress" && !fileName.endsWith(".lz4")) {
        setFileName(`${fileName}.lz4`)
      }
    }
  }

  const refreshVersions = async () => {
    setIsLoadingVersions(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const versions = await fetchVersions(true) // Force refresh
      setAvailableVersions(versions)
    } catch (error) {
      console.error("Failed to refresh versions:", error)
    } finally {
      setIsLoadingVersions(false)
    }
  }

  const clearHistory = () => {
    setCompressionHistory([])
  }

  const deleteHistoryItem = (index: number) => {
    setCompressionHistory((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto max-w-7xl min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div className="w-full">
            <h1 className="flex justify-center">
              <a
                href={"https://jsr.io/@nick/lz4" + (config.version ? "@" + config.version : "") + "/doc"}
                target="_blank"
                title="@nick/lz4"
                rel="noreferrer noopener nofollow"
                className="inline-block select-none my-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="128"
                  height="128"
                  fill="none"
                  viewBox="0 0 320 320"
                  role="img"
                  aria-hidden="true"
                >
                  <rect width="100%" height="100%" fill="#2878D7" rx="33" />
                  <g fill="#fff" filter="url(#a)" transform="translate(16 16) scale(0.9)">
                    <path d="m45.636 159.766-.26 83h60.498999999999995v-26h-34v-140H45.898zM119.875 89.247v12.478l20.395.271 20.395.27-6.436 16.5c-3.54 9.075-7.04 17.85-7.778 19.5s-5.023 12.675-9.523 24.5-11.078 28.661-14.618 37.413l-6.435 15.913v26.674h76v-26h-24.5c-13.475 0-24.5-.172-24.5-.383 0-.21 2.078-5.498 4.618-11.75s9.71-24.417 15.933-40.367 14.492-37.1 18.376-47l7.061-18 .006-11.25.006-11.25h-69z" />
                    <path
                      fillRule="evenodd"
                      d="M231.948 80.493c-1.386 3.885-22.336 54.142-33.68 80.794l-6.393 15.021v27.458h49v39h25v-39h12.066l-.283-11.25-.283-11.25h-11l-.5-52-.5-52-16.041-.273-16.04-.274zm-12.48 86.731c7.796-20.3 17.007-44.703 18.931-50.156 1.009-2.86 2.091-5.04 2.405-4.847.314.194.447 15.471.295 33.949l-.276 33.596h-12.974c-7.136 0-12.974-.131-12.974-.292s2.067-5.673 4.593-12.25"
                      clipRule="evenodd"
                    />
                  </g>
                  <defs>
                    <filter
                      id="a"
                      width="318.447"
                      height="310.745"
                      x="0"
                      y="10"
                      colorInterpolationFilters="sRGB"
                      filterUnits="userSpaceOnUse"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        result="hardAlpha"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      />
                      <feOffset dx="4" dy="5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                      <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_53_8" />
                      <feBlend in="SourceGraphic" in2="effect1_dropShadow_53_8" result="shape" />
                    </filter>
                  </defs>
                </svg>
                <span className="sr-only hidden" hidden="">
                  @nick/lz4
                </span>
              </a>
            </h1>
            <h2 className="text-center text-muted-foreground mb-4">
              Compression playground for the{" "}
              <a href="https://jsr.io/@nick/lz4" target="_blank" rel="noopener noreferrer" className="underline">
                <code>@nick/lz4</code>
              </a>{" "}
              open-source JavaScript package.
            </h2>
          </div>
          <div className="fixed top-4 right-4 z-[99999] group">
            <ThemeToggle className="shadow-md group-hover:shadow-xl transition-all duration-300 ease-in" />
          </div>
        </div>

        {shareError && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Shared Link Warning</AlertTitle>
            <AlertDescription>{shareError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputSection
            inputData={inputData}
            setInputData={setInputData}
            inputType={inputType}
            setInputType={setInputType}
            uploadedFile={uploadedFile}
            handleFileUpload={handleFileUpload}
            handleSampleData={handleSampleData}
            mode={mode}
            toggleMode={toggleMode}
            packageVersion={config.version}
            setPackageVersion={(version) => {
              if (version !== config.version) {
                setConfig({ ...config, version })
              }
            }}
            availableVersions={availableVersions}
            isLoadingVersions={isLoadingVersions}
            refreshVersions={refreshVersions}
            handleProcess={() => handleProcess()}
            isProcessing={isProcessing}
            isBase64={isBase64}
          />

          <OutputSection
            outputData={outputData}
            inputData={inputData}
            mode={mode}
            version={config.version}
            result={outputBinary}
            fileName={fileName}
            setFileName={setFileName}
            error={error}
            isBase64={isBase64}
            updateHistoryFilename={updateHistoryFilename}
            lastProcessedTime={lastProcessedTime}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <MetricsDisplay
            metrics={metrics}
            mode={mode}
            history={compressionHistory}
            onClearHistory={clearHistory}
            onDeleteHistoryItem={deleteHistoryItem}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}
