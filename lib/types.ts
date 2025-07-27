export interface ProcessingConfig {
  version: string;
}

export type Timestamp = string | number | Date;

// deno-lint-ignore ban-types
export type strings = string & {};

export type Mode = "compress" | "decompress";

export interface PerformanceMetrics {
  timestamp: Timestamp;
  originalSize: number;
  resultSize: number;
  ratio: number;
  duration: number;
  speed: number;
  version: string;
}

export interface CompressionHistory extends PerformanceMetrics {
  mode: Mode | strings;
  fileName?: string | null;
}

export interface CompressionResult {
  mode: Mode | strings;
  result: Uint8Array;
  version: string;
  metrics: PerformanceMetrics;
}
