"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";



export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    // Fetch products from backend
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

  useEffect(() => {
    let result = products;
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category && category !== "all") {
      result = result.filter(p => {
        const catName = p.category?.name || p.category || "";
        return catName.toLowerCase().includes(category.toLowerCase());
      });
    }
    if (minPrice) {
      result = result.filter(p => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => Number(p.price) <= Number(maxPrice));
    }
    setFilteredProducts(result);
  }, [search, category, minPrice, maxPrice, products]);

  return (
    <div className="flex flex-col min-h-screen bg-[#030001] text-white relative font-sans selection:bg-[#cfa873] selection:text-[#030001]">
      
      {/* Background Animado Global (Fixed) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         {/* Abstract wavy dark magenta/burgundy background */}
         <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" alt="Texture" className="w-full h-full object-cover opacity-[0.07] mix-blend-overlay" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#030001]/90 via-[#030001]/60 to-[#030001]"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-[#030001] via-pink-950/20 to-[#030001]"></div>
         <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-[150px] -translate-y-1/2"></div>
         <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
         
         {/* Particles */}
         {mounted && Array.from({ length: 50 }).map((_, i) => (
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

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[85vh]">
          <div className="container mx-auto max-w-5xl text-center flex flex-col items-center mt-[-4rem]">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="w-full flex flex-col items-center"
            >
              <motion.img 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                src="/logo-yunan2.png" 
                alt="Yunan Logo" 
                className="h-32 w-32 md:h-44 md:w-44 object-cover rounded-full shadow-[0_0_60px_rgba(207,168,115,0.15)] mb-10 border border-[#cfa873]/20" 
              />
              
              <div className="flex items-center justify-center gap-6 mb-10">
                 <div className="h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent via-[#cfa873]/80 to-[#cfa873]/80"></div>
                 <span className="text-[#cfa873] tracking-[0.4em] text-[10px] md:text-xs font-semibold uppercase">Exclusividad & Elegancia</span>
                 <div className="h-[1px] w-12 md:w-32 bg-gradient-to-l from-transparent via-[#cfa873]/80 to-[#cfa873]/80"></div>
              </div>
              
              <h1 className="font-serif text-5xl md:text-7xl lg:text-[7.5rem] mb-8 leading-[1.05] tracking-tight">
                <span className="text-white block font-light">COLECCIÓN</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3c193] via-[#cfa873] to-[#a38051] block font-normal drop-shadow-[0_0_20px_rgba(207,168,115,0.2)]">PREMIUM</span>
              </h1>
              
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 font-light leading-relaxed tracking-wide">
                Prendas únicas diseñadas para mujeres que aman destacar con belleza, seguridad y estilo inconfundible.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button 
                  onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full bg-gradient-to-r from-[#cfa873] to-[#a38051] text-[#030001] px-12 py-8 text-[11px] font-bold tracking-[0.3em] uppercase shadow-[0_0_30px_rgba(207,168,115,0.3)] hover:shadow-[0_0_50px_rgba(207,168,115,0.5)] hover:scale-105 transition-all w-full sm:w-auto h-auto"
                >
                   <Sparkles className="mr-3 h-4 w-4" /> Ver Catálogo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Catalog */}
        <section id="catalogo" className="container mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 max-w-[1400px]">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="space-y-10 bg-gradient-to-b from-[#0a0508]/95 to-[#050103]/95 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] sticky top-32">
              <div className="space-y-6">
                <h3 className="font-serif text-3xl text-white flex items-center gap-3 mb-2">
                  <Filter className="h-6 w-6 text-[#cfa873]" /> Filtros
                </h3>
                <div className="h-[1px] w-full bg-gradient-to-r from-[#cfa873]/50 to-transparent"></div>
                <div className="relative pt-4">
                  <Search className="absolute left-5 top-[1.8rem] h-4 w-4 text-gray-500" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar diseño..." 
                    className="pl-12 bg-[#050103]/50 border-white/5 text-white placeholder:text-gray-600 rounded-2xl h-14 focus-visible:ring-[#cfa873]/30 focus-visible:border-[#cfa873]/50 text-sm tracking-wide transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-sans font-bold text-[#cfa873] tracking-[0.3em] uppercase ml-2">Colección</label>
                <Select value={category} onValueChange={(val) => { if (val) setCategory(val); }}>
                  <SelectTrigger className="bg-[#050103]/50 border-white/5 text-white rounded-2xl h-14 focus:ring-[#cfa873]/30 tracking-wide text-sm px-5">
                    <SelectValue placeholder="Todas las colecciones" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0508] border-white/10 text-white rounded-2xl backdrop-blur-xl">
                    <SelectItem value="all" className="hover:bg-white/5 py-3 cursor-pointer">Todas las piezas</SelectItem>
                    <SelectItem value="vestidos" className="hover:bg-white/5 py-3 cursor-pointer">Vestidos</SelectItem>
                    <SelectItem value="casacas" className="hover:bg-white/5 py-3 cursor-pointer">Casacas</SelectItem>
                    <SelectItem value="pantalones" className="hover:bg-white/5 py-3 cursor-pointer">Pantalones</SelectItem>
                    <SelectItem value="faldas" className="hover:bg-white/5 py-3 cursor-pointer">Faldas</SelectItem>
                    <SelectItem value="tops" className="hover:bg-white/5 py-3 cursor-pointer">Tops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-sans font-bold text-[#cfa873] tracking-[0.3em] uppercase ml-2">Rango de Precio</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-[1.1rem] text-gray-500 text-sm">S/</span>
                    <Input 
                      type="number" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min" 
                      className="pl-10 bg-[#050103]/50 border-white/5 text-white rounded-2xl h-14 text-sm" 
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-[1.1rem] text-gray-500 text-sm">S/</span>
                    <Input 
                      type="number" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max" 
                      className="pl-10 bg-[#050103]/50 border-white/5 text-white rounded-2xl h-14 text-sm" 
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full gap-3 bg-white/5 hover:bg-[#cfa873] text-white hover:text-[#030001] border border-white/10 hover:border-[#cfa873] rounded-2xl py-8 font-bold text-[10px] tracking-[0.3em] uppercase transition-all duration-500 mt-8 group">
                <SlidersHorizontal className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Aplicar Filtros
              </Button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 content-start">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-6">
                <div className="w-12 h-12 border-4 border-[#cfa873]/30 border-t-[#cfa873] rounded-full animate-spin"></div>
                <p className="text-[#cfa873] font-serif tracking-widest text-sm uppercase">Preparando colección...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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
                <Button variant="outline" onClick={() => {setSearch(""); setCategory("all"); setMinPrice(""); setMaxPrice("");}} className="border-[#cfa873]/30 text-[#cfa873] hover:bg-[#cfa873] hover:text-[#030001] rounded-full px-10 py-6 tracking-[0.3em] uppercase text-[10px] font-bold transition-all duration-500">
                  Actualizar Catálogo
                </Button>
              </div>
            ) : filteredProducts.map((product, index) => {
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
                    {/* Aspect Ratio 2:3 for Luxury Fashion Look */}
                    <div className="aspect-[2/3] relative overflow-hidden bg-[#030001]">
                      <img 
                        src={productImg} 
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-[2000ms] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080305] via-[#080305]/20 to-transparent opacity-90"></div>
                      
                      {/* Category Badge overlaying image */}
                      <div className="absolute top-6 left-6">
                        <Badge variant="secondary" className="bg-[#030001]/95 text-[#cfa873] backdrop-blur-xl border border-[#cfa873]/30 font-sans font-bold tracking-[0.25em] text-[9px] uppercase px-4 py-2 shadow-2xl">
                          {product.category?.name || (typeof product.category === 'string' ? product.category : 'General')}
                        </Badge>
                      </div>

                      {/* Stock Badge */}
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
                        <h3 className="font-serif font-medium text-2xl text-white group-hover:text-[#cfa873] transition-colors line-clamp-2 leading-snug mb-3 drop-shadow-lg">{product.name}</h3>
                        
                        <p className="text-gray-400/80 text-sm font-light line-clamp-2 mb-6 leading-relaxed">
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
            })}
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
