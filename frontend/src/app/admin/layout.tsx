"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/auth/login";
        return;
      }

      const email = session.user.email;
      // Solo permitimos estas dos cuentas como admin
      if (email !== "admin@yunan.com" && email !== "admin@admin.com") {
        window.location.href = "/"; // Redirigir a inicio si no es admin
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, []);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-pink-500 font-bold">Verificando permisos...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950/20">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
