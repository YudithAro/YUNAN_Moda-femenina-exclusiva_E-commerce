"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";



export default function ColeccionPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#030001] flex flex-col items-center text-center p-4 sm:p-8 relative pt-24 pb-20 font-sans selection:bg-[#cfa873] selection:text-[#030001]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030001] via-pink-950/10 to-[#030001] pointer-events-none"></div>
      
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         {mounted && Array.from({ length: 30 }).map((_, i) => (
           <div 
             key={i} 
             className="particle"
             style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               width: `${Math.random() * 6 + 2}px`,
               height: `${Math.random() * 6 + 2}px`,
               animationDuration: `${Math.random() * 15 + 10}s`,
               animationDelay: `${Math.random() * 5}s`,
               boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(207,168,115,0.4)`,
               background: 'rgba(207,168,115,0.2)'
             }}
           />
         ))}
      </div>

      <div className="relative z-10 w-full max-w-[1400px] flex flex-col items-center">
        
        <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3c193] via-[#cfa873] to-[#a38051]">COLECCIÓN</span> COMPLETA
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-16 text-lg font-light tracking-wide">
          Explora todas nuestras piezas diseñadas exclusivamente para ti con la mejor calidad y elegancia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 w-full mb-20">
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-6">
               <div className="w-12 h-12 border-4 border-[#cfa873]/30 border-t-[#cfa873] rounded-full animate-spin"></div>
               <p className="text-[#cfa873] font-serif tracking-widest text-sm uppercase">Preparando colección...</p>
             </div>
          ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-40 px-8">
                <div className="relative mb-10">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#cfa873]/10 to-[#cfa873]/5 flex items-center justify-center border border-[#cfa873]/20 shadow-[0_0_80px_rgba(207,168,115,0.1)]">
                    <Sparkles className="h-14 w-14 text-[#cfa873]/40" />
                  </div>
                  <div className="absolute -inset-4 rounded-full border border-[#cfa873]/10 animate-pulse"></div>
                  <div className="absolute -inset-8 rounded-full border border-[#cfa873]/5"></div>
                </div>
                <h3 className="font-serif text-3xl text-white/90 mb-4 text-center">Colección en preparación</h3>
                <p className="text-gray-500 text-base max-w-md text-center leading-relaxed mb-10 font-light">
                  Estamos preparando piezas exclusivas para ti. Vuelve pronto para descubrir nuestra nueva colección.
                </p>
                <Link href="/">
                  <Button variant="outline" className="border-[#cfa873]/30 text-[#cfa873] hover:bg-[#cfa873] hover:text-[#030001] rounded-full px-10 py-6 tracking-[0.3em] uppercase text-[10px] font-bold transition-all duration-500">
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
          ) : (
            products.map((product, index) => {
              const productImg = getImageUrl((product.images && product.images.length > 0) ? product.images[0] : product.image);
              const productCategory = product.category?.name || product.category || "General";

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    opacity: { duration: 0.8, delay: index * 0.1 },
                    y: { duration: 0.8, delay: index * 0.1, ease: [0.21, 1.11, 0.81, 0.99] }
                  }}
                  className="h-full"
                >
                  <Card className="flex flex-col overflow-hidden border-white/5 bg-[#080305]/80 backdrop-blur-xl hover:border-[#cfa873]/40 transition-all duration-700 group rounded-[2.5rem] h-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(207,168,115,0.15)] hover:-translate-y-3 p-0 border-0">
                    <div className="aspect-[2/3] relative overflow-hidden bg-[#030001]">
                      <img 
                        src={productImg} 
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-[2000ms] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080305] via-[#080305]/20 to-transparent opacity-90"></div>
                      
                      <div className="absolute top-6 left-6">
                        <Badge variant="secondary" className="bg-[#030001]/95 text-[#cfa873] backdrop-blur-xl border border-[#cfa873]/30 font-sans font-bold tracking-[0.25em] text-[9px] uppercase px-4 py-2 shadow-2xl">
                          {productCategory}
                        </Badge>
                      </div>

                      <div className="absolute top-6 right-6">
                        {Number(product.stock) > 0 ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" title="Disponible"></div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" title="Agotado"></div>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-8 relative bg-gradient-to-t from-[#080305] to-transparent mt-[-60px] flex flex-col flex-1 z-10">
                      <div className="flex-1 flex flex-col justify-end pt-10">
                        <h3 className="font-serif font-medium text-2xl text-white group-hover:text-[#cfa873] transition-colors line-clamp-2 leading-snug mb-3 drop-shadow-lg text-left">{product.name}</h3>
                        
                        <p className="text-gray-400/80 text-sm font-light line-clamp-2 mb-6 leading-relaxed text-left">
                          {product.description || "Diseño exclusivo y elegante para resaltar tu belleza natural en cada momento."}
                        </p>
                        
                        <div className="flex items-end gap-2 mb-8">
                          <span className="text-[#cfa873]/60 text-lg font-serif">S/</span>
                          <span className="text-[#cfa873] font-light text-4xl font-serif tracking-tight leading-none">{Number(product.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 mt-auto">
                        <Link href={`/producto/${product.id}`} className="w-full">
                          <Button className="w-full bg-transparent border border-white/20 text-white hover:bg-white hover:text-[#030001] hover:border-white font-bold tracking-[0.25em] uppercase text-[10px] rounded-2xl h-14 transition-all duration-500">
                            Ver Detalles
                          </Button>
                        </Link>
                        
                        <Link href={`https://wa.me/51951162161?text=Hola,%20estoy%20interesada%20en%20la%20prenda%20${encodeURIComponent(product.name)}%20(S/%20${Number(product.price || 0).toFixed(2)})`} target="_blank" className="w-full">
                          <Button className="w-full bg-gradient-to-r from-[#cfa873] to-[#a38051] text-[#030001] border-none font-bold tracking-[0.2em] uppercase text-[10px] rounded-2xl h-14 gap-3 transition-all duration-500 hover:shadow-[0_0_30px_rgba(207,168,115,0.4)] hover:scale-[1.02] group/wa">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="group-hover/wa:scale-110 transition-transform"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            Comprar por WhatsApp
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <Link href="/">
          <button className="flex items-center text-[#cfa873] hover:text-white transition-colors group tracking-widest uppercase text-xs font-bold mt-8 border border-[#cfa873]/30 hover:bg-[#cfa873]/10 px-6 py-4 rounded-full">
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-2 transition-transform" />
            Volver al inicio
          </button>
        </Link>
      </div>
    </div>
  );
}
