import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url: string | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1550614000-4b95d466f397?auto=format&fit=crop&q=80&w=600";
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  if (url.includes('localhost:3000') && apiUrl !== "http://localhost:3000") {
    return url.replace('http://localhost:3000', apiUrl);
  }
  
  if (url.startsWith('/uploads')) {
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    return `${baseUrl}${url}`;
  }
  
  return url;
}
