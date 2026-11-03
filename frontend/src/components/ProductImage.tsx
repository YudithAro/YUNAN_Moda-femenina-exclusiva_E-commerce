"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";

function canOptimize(source: string) {
  if (source.startsWith("/") && !source.startsWith("//")) return true;
  try {
    const url = new URL(source);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1")
      return false;
    if (url.protocol === "https:" && url.hostname === "images.unsplash.com")
      return true;
    return [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_API_URL,
    ]
      .filter(Boolean)
      .some(
        (origin) =>
          url.origin === new URL(origin!).origin &&
          (url.pathname.startsWith("/storage/v1/object/public/") ||
            url.pathname.startsWith("/uploads/")),
      );
  } catch {
    return false;
  }
}

export function ProductImage({
  src,
  alt,
  sizes,
  preload = false,
}: {
  src?: string;
  alt: string;
  sizes: string;
  preload?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = getImageUrl(src);
  if (!src || failedSource === source) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#180e14] p-6 text-center text-sm text-zinc-400">
        Fotografía próximamente
      </div>
    );
  }
  return (
    <Image
      src={source}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      unoptimized={!canOptimize(source)}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailedSource(source)}
    />
  );
}
