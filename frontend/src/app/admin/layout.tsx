"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ApiError, apiJson, getErrorMessage, type CurrentUser } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    apiJson<CurrentUser>("/auth/me").then(user => {
      if (!active) return;
      if (user.role !== "ADMIN") { window.location.replace("/"); return; }
      setIsAuthorized(true);
      setError("");
    }).catch(error => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 401) window.location.replace("/auth/login");
      else setError(getErrorMessage(error));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) window.location.replace("/auth/login");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [retry]);

  useEffect(() => {
    const handleError = (event: Event) => setError((event as CustomEvent<string>).detail);
    window.addEventListener("yunan:api-error", handleError);
    return () => window.removeEventListener("yunan:api-error", handleError);
  }, []);

  if (!isAuthorized) return <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
    <p role={error ? "alert" : "status"}>{error || "Verificando permisos..."}</p>
    {error && <><button onClick={() => { setError(""); setRetry(value => value + 1); }} className="rounded-lg border px-5 py-2">Reintentar</button><Link href="/">Volver a la tienda</Link></>}
  </div>;

  return <div className="min-h-screen bg-slate-50 dark:bg-zinc-950/20">
    <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      {error && <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-red-600 dark:text-red-300">
        <span>{error}</span><button type="button" aria-label="Cerrar mensaje" onClick={() => setError("")}>Cerrar</button>
      </div>}
      {children}
    </main>
  </div>;
}
