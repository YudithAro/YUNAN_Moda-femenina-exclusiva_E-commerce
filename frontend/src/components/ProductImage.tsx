"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";

function canOptimize(source: string) {
  if (source.startsWith("/") && !source.startsWith("//")) return true;
  try {
    const url = new URL(source);
    if (["localhost", "127.0.0.1"].includes(url.hostname)) return false;
    if (url.protocol === "https:" && url.hostname === "images.unsplash.com") return true;
    return [
      [process.env.NEXT_PUBLIC_SUPABASE_URL, "/storage/v1/object/public/"],
      [process.env.NEXT_PUBLIC_API_URL, "/uploads/"],
    ].some(([origin, path]) => origin && url.origin === new URL(origin).origin && url.pathname.startsWith(path!));
  } catch { return false; }
}

export function ProductImage({ src, alt, sizes, preload = false, fit = "contain", className = "" }: {
  src?: string; alt: string; sizes: string; preload?: boolean;
  fit?: "contain" | "cover"; className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = getImageUrl(src);
  if (!src || failedSource === source) return (
    <div className="flex h-full w-full items-center justify-center bg-[#ede9e3] p-5 text-center text-sm text-stone-600">
      {src ? "Imagen no disponible" : "Fotografía próximamente"}
    </div>
  );
  return <Image src={source} alt={alt} fill sizes={sizes} preload={preload}
    unoptimized={!canOptimize(source)}
    className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    onError={() => setFailedSource(source)} />;
}
