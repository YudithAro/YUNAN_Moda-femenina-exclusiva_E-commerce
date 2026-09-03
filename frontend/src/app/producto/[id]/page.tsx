"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Star, Ruler, Truck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";



export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products/${params.id}`)
      .then(res => {
         if (!res.ok) throw new Error("Not found");
         return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading product:", err);
        setProduct(null);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050103] flex items-center justify-center">
        <div className="text-[#cfa873] font-serif animate-pulse">Cargando detalles de la prenda...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050103] flex flex-col items-center justify-center text-white">
        <h1 className="font-serif text-3xl mb-4">Pieza no encontrada</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-[#cfa873] text-[#cfa873] hover:bg-[#cfa873] hover:text-black">
          Volver a la colección
        </Button>
      </div>
    );
  }

  const categoryName = product.category?.name || product.category || "General";

  return (
    <div className="min-h-screen bg-[#050103] text-white pt-24 pb-20 relative">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-b from-[#050103] via-[#0a0508] to-[#050103]"></div>
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-900/10 rounded-full blur-[150px]"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-6xl">
        <button onClick={() => router.push('/')} className="flex items-center text-gray-400 hover:text-[#cfa873] transition-colors mb-8 font-serif text-sm tracking-widest uppercase">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la colección
        </button>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 flex flex-col gap-4"
          >
            <div className="aspect-[3/4] relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
              <img src={getImageUrl((product.images && product.images.length > 0) ? product.images[currentImageIndex] : "https://images.unsplash.com/photo-1550614000-4b95d466f397?auto=format&fit=crop&q=80&w=600")} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050103]/60 via-transparent to-transparent"></div>
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-[#cfa873] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} - view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-1/2 flex flex-col justify-center"
          >
            <Badge variant="secondary" className="w-fit mb-6 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-4 py-1.5 text-xs tracking-widest uppercase">
              {categoryName}
            </Badge>

            <h1 className="font-serif text-4xl lg:text-5xl mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <p className="text-[#cfa873] font-light text-3xl font-serif">S/ {Number(product.price).toFixed(2)}</p>
              <div className="flex items-center text-pink-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <span className="text-gray-400 text-sm ml-2">(12 reseñas)</span>
              </div>
            </div>

            <p className="text-gray-300 font-light leading-relaxed mb-8 text-lg">
              {product.description || "Una pieza exclusiva diseñada para resaltar tu belleza natural con la máxima elegancia y confort. Fabricada con materiales de calidad premium y acabados a mano."}
            </p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-sm tracking-widest text-white/90 uppercase">Talla</h3>
                  <Dialog>
                    <DialogTrigger render={<button className="text-pink-400 text-xs flex items-center hover:underline"><Ruler className="h-3 w-3 mr-1"/> Guía de tallas</button>} />
                    <DialogContent className="sm:max-w-[500px] bg-[#0a0508] text-white border-[#cfa873]/30">
                      <DialogHeader>
                        <DialogTitle className="text-[#cfa873] font-serif text-2xl">Guía de Tallas</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-pink-400 uppercase bg-pink-900/20 border-b border-pink-900/50">
                            <tr>
                              <th className="px-4 py-3">Talla</th>
                              <th className="px-4 py-3">Busto (cm)</th>
                              <th className="px-4 py-3">Cintura (cm)</th>
                              <th className="px-4 py-3">Cadera (cm)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            <tr className="hover:bg-white/5">
                              <td className="px-4 py-3 font-bold text-[#cfa873]">S</td>
                              <td className="px-4 py-3">86-90</td>
                              <td className="px-4 py-3">66-70</td>
                              <td className="px-4 py-3">90-94</td>
                            </tr>
                            <tr className="hover:bg-white/5">
                              <td className="px-4 py-3 font-bold text-[#cfa873]">M</td>
                              <td className="px-4 py-3">90-94</td>
                              <td className="px-4 py-3">70-74</td>
                              <td className="px-4 py-3">94-98</td>
                            </tr>
                            <tr className="hover:bg-white/5">
                              <td className="px-4 py-3 font-bold text-[#cfa873]">L</td>
                              <td className="px-4 py-3">94-100</td>
                              <td className="px-4 py-3">74-80</td>
                              <td className="px-4 py-3">98-104</td>
                            </tr>
                            <tr className="hover:bg-white/5">
                              <td className="px-4 py-3 font-bold text-[#cfa873]">XL</td>
                              <td className="px-4 py-3">100-106</td>
                              <td className="px-4 py-3">80-86</td>
                              <td className="px-4 py-3">104-110</td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="text-xs text-gray-400 mt-4 italic">
                          * Estas medidas son aproximadas y pueden variar ligeramente dependiendo del diseño y la tela de la prenda.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-12 px-3 rounded-full border flex items-center justify-center font-serif text-sm transition-all ${selectedSize === size ? 'border-[#cfa873] text-[#cfa873] bg-[#cfa873]/10' : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-sm tracking-widest text-white/90 uppercase">Color</h3>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color: string) => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 h-10 rounded-full border flex items-center justify-center font-serif text-sm transition-all ${selectedColor === color ? 'border-[#cfa873] text-[#cfa873] bg-[#cfa873]/10' : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => {
                let text = `Hola, estoy interesada en la prenda ${product.name} (S/ ${Number(product.price).toFixed(2)})`;
                if (selectedSize) text += `\nTalla seleccionada: ${selectedSize}`;
                if (selectedColor) text += `\nColor seleccionado: ${selectedColor}`;
                const message = encodeURIComponent(text);
                window.open(`https://wa.me/51951162161?text=${message}`, '_blank');
              }}
              className="w-full gap-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-8 text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_35px_rgba(22,163,74,0.6)] hover:scale-[1.02] transition-all border border-green-400/30 mb-4"
            >
              <MessageCircle className="h-5 w-5" />
              Comprar solo por WhatsApp
            </Button>

            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-pink-400" />
                <span>Envío express gratuito en compras superiores a S/ 200</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
