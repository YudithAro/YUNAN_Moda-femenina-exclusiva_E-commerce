"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050103]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-4 group">
          <img 
            src="/logo-yunan2.png" 
            alt="YUNAN Logo" 
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-contain shadow-[0_0_15px_rgba(230,46,117,0.3)] group-hover:shadow-[0_0_20px_rgba(230,46,117,0.6)] transition-all"
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400 font-bold drop-shadow-sm">YUNAN</span>
            <span className="hidden sm:block text-[10px] text-[#cfa873] tracking-[0.2em] uppercase mt-0.5 font-medium">Moda femenina exclusiva</span>
          </div>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-10 text-xs font-semibold tracking-widest uppercase text-gray-300">
          <Link href="/" className="hover:text-pink-400 transition-colors">Inicio</Link>
          <Link href="/coleccion" className="hover:text-pink-400 transition-colors">Colección</Link>
          <Link href="/novedades" className="hover:text-pink-400 transition-colors">Novedades</Link>
          <Link href="/nosotros" className="hover:text-pink-400 transition-colors">Sobre Nosotros</Link>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="md:hidden text-pink-400 rounded-full h-10 w-10">
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="hidden md:flex gap-2 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 uppercase tracking-widest text-[10px] font-bold rounded-full px-5 py-5 transition-all">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="md:hidden text-gray-400 rounded-full h-10 w-10">
                <LogOut className="h-5 w-5" />
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="hidden md:flex gap-2 text-gray-400 hover:text-white hover:bg-white/10 uppercase tracking-widest text-[10px] font-bold rounded-full px-5 py-5 transition-all">
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="icon" className="md:hidden text-pink-400 rounded-full h-10 w-10">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="hidden md:flex gap-2 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 uppercase tracking-widest text-[10px] font-bold rounded-full px-5 py-5 transition-all">
                <User className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
          )}

          <Button className="gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-full px-4 sm:px-6 py-4 sm:py-5 shadow-[0_0_15px_rgba(230,46,117,0.3)] hover:shadow-[0_0_25px_rgba(230,46,117,0.6)] hover:scale-105 transition-all uppercase tracking-widest text-[10px] font-bold border border-pink-400/30">
            <ShoppingBag className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline-block">Comprar</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0a0508]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-6 text-sm font-semibold tracking-widest uppercase text-gray-300">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pink-400 transition-colors py-2">Inicio</Link>
              <Link href="/coleccion" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pink-400 transition-colors py-2">Colección</Link>
              <Link href="/novedades" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pink-400 transition-colors py-2">Novedades</Link>
              <Link href="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pink-400 transition-colors py-2">Sobre Nosotros</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
