import { decodeBase64, encodeBase64 } from "@/lib/binary-utils";

// Maximum size for data to be included directly in URL (in bytes)
// Beyond this size, we'll suggest using a file sharing service
const MAX_URL_DATA_SIZE = 2000;

interface ShareableState {
  d: string; // data (base64 encoded)
  m: string; // mode (c for compress, d for decompress)
  v: string; // version
  f?: string; // filename (optional)
  o?: string; // output data (base64 encoded, optional)
  t?: number; // timestamp (optional)
}

/**
 * Creates a shareable link from the current state
 */
export function createShareableLink(
  inputData: string,
  mode: string,
  version: string,
  fileName: string | null,
  outputData: string | null = null,
  timestamp: number | null = null,
): { url: string; isDataTooLarge: boolean } {
  // Prepare the state object
  const state: ShareableState = {
    d: encodeBase64(new TextEncoder().encode(inputData)),
    m: mode === "compress" ? "c" : "d",
    v: version,
  };

  if (fileName) {
    state.f = encodeURIComponent(fileName);
  }

  if (outputData) {
    state.o = encodeBase64(new TextEncoder().encode(outputData));
  }

  if (timestamp) {
    state.t = timestamp;
  }

  // Check if the data is too large for a URL
  const isDataTooLarge = state.d.length > MAX_URL_DATA_SIZE;

  // If data is too large, don't include it in the URL
  if (isDataTooLarge) {
    delete state.d;
    delete state.o;
  }

  // Create the URL
  const stateParam = encodeURIComponent(JSON.stringify(state));
  const url =
    `${window.location.origin}${window.location.pathname}?state=${stateParam}`;

  return { url, isDataTooLarge };
}

/**
 * Parses a shareable link to extract the state
 */
export function parseShareableLink(url: string): {
  inputData: string | null;
  mode: string;
  version: string;
  fileName: string | null;
  outputData: string | null;
  timestamp: number | null;
  isDataMissing: boolean;
} {
  try {
    const urlObj = new URL(url);
    const stateParam = urlObj.searchParams.get("state");

    if (!stateParam) {
      throw new Error("No state parameter found in URL");
    }

    const state: ShareableState = JSON.parse(decodeURIComponent(stateParam));

    // Check if data is missing (was too large for URL)
    const isDataMissing = !state.d;

    // Parse the state
    return {
      inputData: state.d
        ? new TextDecoder().decode(decodeBase64(state.d))
        : null,
      mode: state.m === "c" ? "compress" : "decompress",
      version: state.v,
      fileName: state.f ? decodeURIComponent(state.f) : null,
      outputData: state.o
        ? new TextDecoder().decode(decodeBase64(state.o))
        : null,
      timestamp: state.t || null,
      isDataMissing,
    };
  } catch (error) {
    console.error("Error parsing shareable link:", error);
    return {
      inputData: null,
      mode: "compress",
      version: "",
      fileName: null,
      outputData: null,
      timestamp: null,
      isDataMissing: true,
    };
  }
}
