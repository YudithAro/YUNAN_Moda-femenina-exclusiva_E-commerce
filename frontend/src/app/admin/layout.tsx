"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Building2, ChevronRight, CircleAlert, ExternalLink, LayoutDashboard, LogOut, Menu, Package, Plus, Settings, ShoppingBag, Tags, Ticket, Truck, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ApiError, apiJson, getErrorMessage, type CurrentUser } from "@/lib/api";
import { ManualSaleDialog } from "@/components/admin/ManualSaleDialog";
import { FeedbackCenter } from "@/components/admin/FeedbackCenter";
import { ActionConfirmation } from "@/components/admin/ActionConfirmation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const sections = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/products", icon: Package },
  { label: "Categorías", href: "/admin/categories", icon: Tags },
  { label: "Ventas", href: "/admin/sales", icon: ShoppingBag },
  { label: "Envíos", href: "/admin/shipping", icon: Truck },
  { label: "Clientes", href: "/admin/customers", icon: Users },
  { label: "Cupones", href: "/admin/coupons", icon: Ticket },
  { label: "Proveedores", href: "/admin/suppliers", icon: Building2 },
  { label: "Alertas de stock", href: "/admin/alerts", icon: CircleAlert },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const menuOpen = menuPath === pathname;
  const current = sections.find(section => section.href === pathname) || sections[0];
  useEffect(() => {
    let active = true;
    apiJson<CurrentUser>("/auth/me").then(profile => {
      if (!active) return;
      if (profile.role !== "ADMIN") { router.replace("/"); return; }
      setUser(profile); setError("");
    }).catch(reason => {
      if (!active) return;
      if (reason instanceof ApiError && reason.status === 401) router.replace("/auth/login");
      else setError(getErrorMessage(reason));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) router.replace("/auth/login");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [retry, router]);

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) { window.dispatchEvent(new CustomEvent("yunan:api-error", { detail: "No pudimos cerrar la sesión. Inténtalo nuevamente." })); return; }
    router.replace("/");
  }

  if (!user) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#111114] p-6 text-center">
    <Image src="/logo-yunan2.png" alt="YUNAN" width={56} height={56} className="mb-2 rounded-full" />
    <p role={error ? "alert" : "status"} className="max-w-md text-sm leading-7 text-zinc-200">{error || "Verificando tu acceso al panel..."}</p>
    {error && <><button onClick={() => { setError(""); setRetry(value => value + 1); }} className="min-h-11 rounded-xl border border-white/20 px-5 text-sm">Reintentar</button><Link href="/" className="text-sm text-zinc-400 underline">Volver a la tienda</Link></>}
  </div>;

  function navigation(close = false) {
    return <nav aria-label={close ? "Secciones del panel en celular" : "Secciones del panel"} className="space-y-1">
      {sections.map(section => {
        const Icon = section.icon;
        const active = pathname === section.href || (section.href === "/admin" && pathname === "/admin/dashboard");
        return <Link key={section.href} href={section.href} onClick={() => { if (close) setMenuPath(null); }} aria-current={active ? "page" : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${active ? "bg-white/10 font-medium text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}>
          <Icon size={18} className={active ? "text-[#d4b383]" : ""} />{section.label}
          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d4b383]" />}
        </Link>;
      })}
    </nav>;
  }

  return <div className="admin-shell min-h-screen bg-[#111114] text-zinc-100">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/10 bg-[#151519] px-4 py-6 lg:flex">
      <Link href="/admin" aria-label="YUNAN administración" className="mb-9 flex items-center gap-3 px-2"><Image src="/logo-yunan2.png" alt="" width={38} height={38} className="rounded-full shadow-[0_0_15px_rgba(230,46,117,0.3)]" /><span><span className="block bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text font-serif text-xl font-bold tracking-wide text-transparent">YUNAN</span><span className="text-xs text-zinc-400">Administración</span></span></Link>
      {navigation()}
      <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"><ExternalLink size={17} />Ver tienda</Link>
        <button type="button" onClick={() => void logout()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"><LogOut size={17} />Cerrar sesión</button>
      </div>
    </aside>

    <div className="min-w-0 lg:pl-60">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111114]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button type="button" aria-label="Abrir navegación del panel" aria-haspopup="dialog" onClick={() => setMenuPath(pathname)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 lg:hidden"><Menu size={20} /></button>
          <div aria-label="Ubicación actual" className="flex min-w-0 items-center gap-2 text-sm"><Link href="/admin" className="hidden text-zinc-400 sm:block">Administración</Link><ChevronRight size={14} className="hidden text-zinc-600 sm:block" /><span className="truncate font-medium">{current.label}</span></div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link href="/admin/products#nuevo" onClick={() => { if (pathname === "/admin/products") window.dispatchEvent(new Event("yunan:new-product")); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-3 text-sm font-medium text-zinc-200 hover:bg-white/5" aria-label="Añadir producto"><Plus size={17} /><span className="hidden sm:inline">Añadir producto</span></Link>
            <ManualSaleDialog compact onSaved={() => { window.dispatchEvent(new Event("yunan:refresh")); }} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
    <Dialog open={menuOpen} onOpenChange={open => setMenuPath(open ? pathname : null)}>
      <DialogContent className="bottom-0 left-0 top-0 flex h-dvh max-h-dvh w-[min(88vw,320px)] max-w-none translate-x-0 translate-y-0 flex-col overflow-y-auto rounded-none bg-[#151519] p-5 sm:max-w-none">
        <DialogHeader className="mb-4 pr-8"><DialogTitle className="flex items-center gap-3 font-serif text-2xl"><Image src="/logo-yunan2.png" alt="" width={38} height={38} className="rounded-full" /><span className="bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">YUNAN</span></DialogTitle><p className="text-sm text-zinc-400">Panel de administración</p></DialogHeader>
        {navigation(true)}
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4"><p className="truncate px-3 text-xs text-zinc-400">{user.email}</p><Link href="/" className="flex min-h-11 items-center gap-3 px-3 text-sm text-zinc-300"><ArrowLeft size={17} />Volver a la tienda</Link><button type="button" onClick={() => void logout()} className="flex min-h-11 items-center gap-3 px-3 text-sm text-zinc-300"><LogOut size={17} />Cerrar sesión</button></div>
      </DialogContent>
    </Dialog>
    <FeedbackCenter />
    <ActionConfirmation />
  </div>;
}
