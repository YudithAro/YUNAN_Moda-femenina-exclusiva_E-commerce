"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NEW_ARRIVALS = [
  { id: 7, name: "Abrigo Lana Premium", category: "Abrigos", price: 250.00, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600" },
  { id: 8, name: "Vestido Cóctel Rojo", category: "Vestidos", price: 175.50, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600" },
  { id: 9, name: "Conjunto Sastre Mujer", category: "Conjuntos", price: 299.99, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600" }
];

export default function NovedadesPage() {
  return (
    <div className="min-h-screen bg-[#050103] flex flex-col items-center text-center p-4 sm:p-8 relative pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/10 to-[#050103] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Star className="text-[#cfa873] fill-[#cfa873] h-8 w-8 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Nuevos Ingresos</h1>
        <p className="text-zinc-400 max-w-md mx-auto mb-16 text-lg">
          Descubre las últimas tendencias y piezas exclusivas que acaban de llegar a nuestra colección.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-16">
          {NEW_ARRIVALS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: [0, -10, 0], 
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: index * 0.15 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
              }}
            >
              <Card className="overflow-hidden border-white/5 bg-[#0a0508]/40 backdrop-blur-sm hover:border-pink-500/30 transition-all duration-500 group rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.15)] text-left h-full flex flex-col">
                <div className="aspect-square sm:aspect-[3/4] relative overflow-hidden bg-[#050103]">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050103] via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <Badge variant="secondary" className="bg-[#050103]/80 text-[#cfa873] backdrop-blur-md border border-[#cfa873]/30 font-serif tracking-widest text-[9px] sm:text-[10px] uppercase px-2 py-1 sm:px-3 sm:py-1">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-6 relative bg-gradient-to-t from-[#050103] to-[#0a0508]/50 mt-[-2px] flex flex-col flex-1 justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif font-normal text-xl text-white/90 group-hover:text-pink-300 transition-colors mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-[#cfa873] font-light text-2xl font-serif mb-6">S/ {product.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/producto/${product.id}`} className="flex-1">
                      <Button className="w-full bg-transparent border border-[#cfa873] text-[#cfa873] hover:bg-[#cfa873] hover:text-[#050103] font-bold tracking-widest uppercase text-[10px] rounded-full h-10 transition-colors">
                        Detalles
                      </Button>
                    </Link>
                    
                    <Link href={`https://wa.me/51951162161?text=Hola,%20estoy%20interesada%20en%20la%20prenda%20${encodeURIComponent(product.name)}%20(S/%20${product.price.toFixed(2)})`} target="_blank" className="flex-1">
                      <Button className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] border-none font-bold tracking-widest uppercase text-[10px] rounded-full h-10 gap-1.5 transition-colors shadow-[0_0_10px_rgba(37,211,102,0.3)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Pedir
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Link href="/">
          <button className="flex items-center text-pink-400 hover:text-white transition-colors group tracking-widest uppercase text-xs font-bold mt-8">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </button>
        </Link>
      </div>
    </div>
  );
}
