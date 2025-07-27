/**
 * Utility functions for downloading files
 */

/**
 * Downloads a file with the given data and filename
 */
export function downloadOutputFile(
  data: Uint8Array,
  originalFileName: string | null | undefined,
  mode: string,
): void {
  // Generate a filename if none is provided
  let fileName = originalFileName || `file-${Date.now()}`;

  // Add or modify extension based on mode
  if (mode === "compress") {
    // If the file doesn't already have an .lz4 extension, add it
    if (!fileName.endsWith(".lz4")) {
      fileName = `${fileName}.lz4`;
    }
  } else {
    // For decompressed files, remove .lz4 extension if present
    if (fileName.endsWith(".lz4")) {
      fileName = fileName.slice(0, -4);
    }
  }

  // Create a blob from the data
  const blob = new Blob([data]);

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  // Append to the document, click, and remove
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
