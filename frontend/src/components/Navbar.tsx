"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/coleccion", label: "Colección" },
  { href: "/novedades", label: "Novedades" },
  { href: "/nosotros", label: "Nosotros" },
];

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const menuOpen = openPath === pathname;

  useEffect(() => {
    let active = true;
    let authVersion = 0;
    const updateSession = async (token?: string) => {
      const version = ++authVersion;
      if (!active) return;
      setIsLoggedIn(Boolean(token));
      setIsAdmin(false);
      if (!token) return;
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        ).replace(/\/$/, "");
        const response = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(30000),
        });
        if (response.ok) {
          const user: { role: string } = await response.json();
          if (active && version === authVersion)
            setIsAdmin(user.role === "ADMIN");
        }
      } catch {
        /* Navigation remains available while account status is unavailable. */
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      void updateSession(data.session?.access_token);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void updateSession(session?.access_token);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutError("No pudimos cerrar la sesión. Inténtalo nuevamente.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-50 border-b border-white/5 bg-[#050103]/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4">
        <button
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setOpenPath(menuOpen ? null : pathname)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
        <Link
          href="/"
          aria-label="YUNAN, inicio"
          className="group flex shrink-0 items-center gap-2 sm:gap-4"
        >
          <Image
            src="/logo-yunan2.png"
            alt=""
            width={48}
            height={48}
            preload
            className="h-10 w-10 rounded-full object-contain shadow-[0_0_15px_rgba(230,46,117,0.3)] transition-shadow group-hover:shadow-[0_0_20px_rgba(230,46,117,0.6)] sm:h-12 sm:w-12"
          />
          <span className="flex flex-col">
            <span className="bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text font-serif text-xl font-bold tracking-widest text-transparent drop-shadow-sm sm:text-3xl">YUNAN</span>
            <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#cfa873] sm:block">Moda femenina exclusiva</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`py-3 text-xs font-semibold tracking-wide transition-colors ${pathname === link.href ? "text-[#e3c193]" : "text-zinc-300 hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Panel de administración"
              title="Administración"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-[#e3c193] hover:bg-white/10 sm:flex"
            >
              <LayoutDashboard size={20} />
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <Link
              href="/auth/login"
              aria-label="Iniciar sesión"
              title="Iniciar sesión"
              className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
            >
              <User size={20} />
            </Link>
          )}
          <Link
            href="/coleccion"
            aria-label="Comprar, explorar colección"
            className="flex min-h-11 items-center gap-2 rounded-full bg-[#cfa873] px-3 text-xs font-semibold text-black hover:bg-[#e3c193]"
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Comprar</span>
          </Link>
        </div>
      </div>
      {logoutError && (
        <p role="alert" className="px-4 pb-3 text-center text-sm text-rose-300">
          {logoutError}
        </p>
      )}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="flex flex-col border-t border-white/10 px-4 py-2 md:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpenPath(null)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-lg px-3 py-3 text-sm ${pathname === link.href ? "text-[#e3c193]" : "text-zinc-200"}`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && <Link href="/admin" onClick={() => setOpenPath(null)} className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-pink-300"><LayoutDashboard size={17} />Administración</Link>}
        </div>
      )}
    </nav>
  );
}
