export interface ProcessingConfig {
  version: string
}

export type Timestamp = string | number | Date

export interface PerformanceMetrics {
  timestamp: Timestamp
  originalSize: number
  resultSize: number
  ratio: number
  duration: number
  speed: number
  version: string
}

export interface CompressionHistory extends PerformanceMetrics {
  mode: "compress" | "decompress"
  fileName?: string | null
}

export interface CompressionResult {
  mode: "compress" | "decompress"
  result: Uint8Array
  version: string
  metrics: PerformanceMetrics
}
