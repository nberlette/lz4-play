// deno-lint-ignore-file no-explicit-any
import * as semver from "semver";

export interface VersionInfo {
  version: string;
  latest?: boolean;
  yanked?: boolean;
}

// Cache for versions to avoid unnecessary fetches
let cachedVersions: VersionInfo[] | null = null;

export async function fetchVersions(
  forceRefresh = false,
): Promise<VersionInfo[]> {
  // Return cached versions if available and not forcing refresh
  if (cachedVersions && !forceRefresh) return cachedVersions;
  try {
    const response = await fetch("https://jsr.io/@nick/lz4/meta.json");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch versions: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Extract and format versions
    let latestVersion = data.latest;
    let versions: VersionInfo[] = Object.entries(data.versions)
      .map(([version, info]: [string, any]) => ({
        version,
        yanked: info.yanked || false,
      }))
      .filter((v) => !v.yanked)
      .sort((a, b) => semver.rcompare(a.version, b.version) ?? 0);
    latestVersion ??= versions[0]?.version;
    versions = versions.map((v) => ({
      ...v,
      latest: v.version === latestVersion,
    }));
    // Cache the results
    cachedVersions = versions;
    return versions;
  } catch (error) {
    console.error("Error fetching versions:", error);
    // Return a default version if fetch fails
    return [{ version: "0.3.4", latest: true }];
  }
}
