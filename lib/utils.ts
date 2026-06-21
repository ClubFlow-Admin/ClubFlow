import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLocation(city?: string | null, state?: string | null) {
  return [city, state].filter(Boolean).join(", ");
}

const BLOCKED_SOURCE_HOSTS = new Set(["example.com", "www.example.com", "localhost"]);

/**
 * Guards against linking readers to fake/placeholder/unreachable "original source" URLs.
 * Rejects empty values, example.com (used for seeded demo articles), localhost,
 * relative paths, and anything that doesn't parse as an absolute http(s) URL.
 */
export function isValidExternalSourceUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (BLOCKED_SOURCE_HOSTS.has(parsed.hostname.toLowerCase())) return false;
  if (parsed.hostname.endsWith(".example.com")) return false;

  return true;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
