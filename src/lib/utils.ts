import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function formatScheduledTime(date: string | Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, -1); // Format: 2025-10-09T10:51:31.129
}

/** Extract the first non-empty string from a JSON-array-formatted text field. */
export function extractFirstFromArray(value: string | null | undefined): string | null {
  if (!value) return null;
  const str = String(value).trim();
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        const first = arr.find((item: unknown) => item !== null && item !== undefined && String(item).trim() !== '');
        return first != null ? String(first) : null;
      }
    } catch {
      // Not valid JSON, fall through
    }
  }
  return str || null;
}

/** Format a duration value (possibly array-formatted) into a readable string like "1m 7s". */
export function formatCallDuration(value: string | null | undefined): string {
  const raw = extractFirstFromArray(value);
  if (!raw) return 'N/A';
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  const totalSeconds = Math.round(num * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/** Parse a JSON-array-formatted text field into a full array of values. */
export function parseCallArray(value: string | null | undefined): (string | null)[] {
  if (!value) return [];
  const str = String(value).trim();
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) return arr;
    } catch { /* fall through */ }
  }
  return str ? [str] : [];
}

/** Format a single duration number (in minutes) into a readable string like "1m 7s". */
export function formatSingleDuration(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return 'N/A';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 'N/A';
  const totalSeconds = Math.round(num * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
