import * as semver from "semver";

interface VersionInfo {
  version: string
  latest?: boolean
  yanked?: boolean
}

// Cache for versions to avoid unnecessary fetches
let cachedVersions: VersionInfo[] | null = null

export async function fetchVersions(forceRefresh = false): Promise<VersionInfo[]> {
  // Return cached versions if available and not forcing refresh
  if (cachedVersions && !forceRefresh) {
    return cachedVersions
  }

  try {
    // Fetch metadata from JSR
    const response = await fetch("https://jsr.io/@nick/lz4/meta.json")

    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract and format versions
    let latestVersion = data.latest
    const versions: VersionInfo[] = Object.entries(data.versions)
      .map(([version, info]: [string, any], index) => ({
        version,
        latest: (latestVersion && version === latestVersion) || index === 0,
        yanked: info.yanked || false,
      }))
      // Filter out yanked versions
      .filter((v) => !v.yanked)
      // Sort by version number (newest first)
      .sort((a, b) => semver.rcompare(a.version, b.version));

    if (latestVersion === null) return 
    // Cache the results
    cachedVersions = versions
    return versions
  } catch (error) {
    console.error("Error fetching versions:", error)
    // Return a default version if fetch fails
    return [{ version: "0.3.2", latest: true }]
  }
}
