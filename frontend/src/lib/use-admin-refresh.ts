"use client";

import { useEffect, useRef } from "react";

export function useAdminRefresh(refresh: () => void | Promise<void>) {
  const latest = useRef(refresh);
  useEffect(() => { latest.current = refresh; });
  useEffect(() => {
    const listener = () => { void latest.current(); };
    window.addEventListener("yunan:refresh", listener);
    return () => window.removeEventListener("yunan:refresh", listener);
  }, []);
}
