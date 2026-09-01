"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeBadgeIndex, setActiveBadgeIndex] = useState(0);
  const badges = ["+ VESTIDOS", "+ BLUSAS", "+ ACCESORIOS", "+ ZAPATOS"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBadgeIndex((prev) => (prev + 1) % badges.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        localStorage.setItem("token", data.session.access_token);
        window.location.href = '/admin';
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Correo o contraseña incorrectos");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-[#111111] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5"
      >
        {/* Columna Izquierda (Visual) */}
        <div className="hidden md:flex md:w-1/2 p-12 flex-col items-center justify-center relative bg-gradient-to-b from-[#111111] to-[#1a0f14] border-r border-white/5">
          <div className="mb-12">
            <img src="/logo-yunan2.png" alt="YUNAN" className="h-48 w-auto object-contain rounded-full shadow-[0_0_40px_rgba(219,39,119,0.4)]" />
          </div>
          
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-serif text-pink-500 italic tracking-wide">
              "Brilla Bonito"
            </h2>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
              Moda premium que cuenta tu historia bajo la luz de la elegancia.
            </p>
          </div>

          <div className="h-10 mt-auto flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeBadgeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-2 rounded-full border border-pink-500/50 text-pink-400 text-sm tracking-wider uppercase bg-pink-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(219,39,119,0.2)] font-bold inline-block"
              >
                {badges[activeBadgeIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          
          {/* Decorative dots */}
          <div className="flex gap-2 mt-6">
            {badges.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBadgeIndex ? 'bg-pink-500 w-5 shadow-[0_0_10px_rgba(219,39,119,0.5)]' : 'bg-zinc-700 w-1.5'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Columna Derecha (Formulario) */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#0d0d0d]">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 font-serif">Bienvenid@ de vuelta</h1>
            <p className="text-zinc-400">Entra a tu universo de moda exclusiva</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-sm border border-red-500/20 text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="hola@ejemplo.com" 
                  required 
                  className="pl-12 h-14 bg-[#1a1a1a] text-white border-white/10 focus-visible:ring-2 focus-visible:ring-pink-500 rounded-xl font-medium placeholder:text-zinc-500" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input 
                  id="password"
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className="pl-12 pr-12 h-14 bg-[#1a1a1a] text-white border-white/10 focus-visible:ring-2 focus-visible:ring-pink-500 rounded-xl font-medium placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 mt-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)] group"
            >
              {isLoading ? "INGRESANDO..." : (
                <span className="flex items-center gap-2">
                  INGRESAR AL PORTAL 
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center text-sm text-zinc-500">
            ¿No tienes cuenta? <Link href="/auth/register" className="text-pink-500 hover:text-pink-400 font-bold ml-1 transition-colors">Regístrate aquí</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
