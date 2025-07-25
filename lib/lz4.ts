"use client"

import type { CompressionResult } from "@/lib/types"
import { MAX_SPEED_MBPS } from "@/lib/constants"

interface LZ4Module {
  compress(data: Uint8Array): Uint8Array
  decompress(data: Uint8Array): Uint8Array
}

interface LoadedModule {
  ready: boolean
  version: string
  exports: LZ4Module
}

interface NonLoadedModule {
  ready?: boolean | undefined
  version?: undefined
  exports?: undefined
}

export type LZ4 = LoadedModule | NonLoadedModule

export const lz4: LZ4 = {
  ready: false,
  version: undefined,
  exports: undefined,
} as LZ4

// Function to load the LZ4 module
async function load_lz4(version: string): Promise<LZ4> {
  // Clear previous module if version changes
  if (lz4.exports && lz4.version !== version) {
    lz4.exports = lz4.version = undefined!
    lz4.ready = false
  }

  if (!lz4.ready) {
    try {
      lz4.exports = await (0, eval)(`import("https://nick.deno.dev/@jsr/nick__lz4@${version}/es2022/nick__lz4.mjs")`)
      lz4.version = version
      lz4.ready = true
    } catch (error) {
      console.error("Failed to load LZ4 module:", error)
      lz4.version = "0.3.2"
      lz4.exports = /* vomit */ await (0, eval)(
        `import("https://nick.deno.dev/@jsr/nick__lz4@0.3.2/es2022/nick__lz4.mjs")`,
      )
      lz4.ready = true
    }
  }

  return lz4
}

// Process data with LZ4
export async function run(
  data: Uint8Array,
  config: {
    mode: string
    version: string
  },
): Promise<CompressionResult> {
  // Load the LZ4 module
  const { version, exports: lz4 } = await load_lz4(config.version)
  if (!lz4) {
    throw new ReferenceError(`Failed to load @nick/lz4@${version} from JSR`)
  }
  // Process the data
  const { mode = "compress" } = config
  const fn = mode === "decompress" ? "decompress" : "compress"

  const startTime = performance.now()
  const result = lz4[fn](data.slice())
  const endTime = performance.now()
  const duration = endTime - startTime

  // Calculate metrics
  const originalSize = data.length
  const resultSize = result.length

  let ratio = 0
  if (mode === "compress") {
    // For compression, ratio is how much smaller the result is (1.0 = 100% reduction, 0 = no reduction)
    ratio = originalSize > 0 ? (originalSize - resultSize) / originalSize : 0
  } else {
    // For decompression, ratio is how much the data expanded
    ratio = originalSize > 0 ? resultSize / originalSize : 0
  }

  // Format ratio to a maximum of 3 decimal places
  ratio = +ratio.toFixed(3)

  // Calculate speed in MB/s
  const dataSizeMB = originalSize / (1024 * 1024)
  let speed = dataSizeMB / (duration / 1000)

  // Ensure speed is finite and reasonable
  if (!isFinite(speed) || speed > MAX_SPEED_MBPS) {
    speed = 0
  }

  return {
    mode,
    result,
    version,
    metrics: {
      timestamp: Date.now(),
      originalSize,
      resultSize,
      ratio,
      duration,
      speed,
      version,
    },
  }
}

export default run
