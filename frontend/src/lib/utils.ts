import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  
  if (process.env.VERCEL_URL) {
    // Reference: https://vercel.com/docs/concepts/projects/environment-variables
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getApiUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}
