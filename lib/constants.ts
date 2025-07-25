/**
 * Application constants for the LZ4 playground
 */

/**
 * Minimum duration in milliseconds to prevent division by zero
 * in speed calculations and avoid infinity values
 */
export const MIN_DURATION_MS = 0.1;

/**
 * Maximum speed limit in MB/s to prevent unrealistic display values
 * Cap at 10GB/s which is unrealistic but prevents display issues
 */
export const MAX_SPEED_MBPS = 10000;