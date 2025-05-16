/**
 * Utility functions for handling binary data
 */

/**
 * Encodes a Uint8Array to a base64 string
 */
export function encodeBase64(data: Uint8Array): string {
  // Use the browser's built-in btoa function with a trick to handle binary data
  return btoa(Array.from(data, (c) => String.fromCharCode(c)).join(""));
}

/**
 * Decodes a base64 string to a Uint8Array
 */
export function decodeBase64(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/**
 * Checks if a string is likely base64 encoded
 */
export function isLikelyBase64(str: string): boolean {
  // Base64 strings are typically multiples of 4 characters
  // and only contain A-Z, a-z, 0-9, +, /, and = (for padding)
  const base64Regex = /^[A-Za-z0-9+/_-]*={0,2}$/

  // Check if the string matches the base64 pattern and is a multiple of 4 in length
  // (or has proper padding to make it a multiple of 4)
  return base64Regex.test(str) && str.length % 4 === 0
}

/**
 * Attempts to detect if data is binary
 */
export function isBinaryData(data: Uint8Array): boolean {
  // Check a sample of the data for non-text characters
  const sampleSize = Math.min(1000, data.length)
  let nonTextChars = 0

  for (let i = 0; i < sampleSize; i++) {
    const byte = data[i]
    // Consider bytes outside printable ASCII range as binary
    if (byte < 32 || byte > 126) {
      nonTextChars++
    }
  }

  // If more than 10% of the sample is non-text, consider it binary
  return nonTextChars / sampleSize > 0.1
}
