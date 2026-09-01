"use client";

import { MapPin, Phone, CreditCard, Truck, Camera, Clock, AlertTriangle, ShieldCheck, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NosotrosPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floating animation definition
  const floatingAnimation: any = {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-[#050103] text-white pt-32 pb-20 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" alt="Texture" className="w-full h-full object-cover opacity-10 mix-blend-overlay" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#050103]/80 via-transparent to-[#050103]"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-[#050103] via-pink-900/10 to-[#050103]"></div>
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px] -translate-y-1/2"
         />
         <motion.div 
           animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[150px]"
         />
         
         {/* Particles */}
         {mounted && Array.from({ length: 40 }).map((_, i) => (
           <div 
             key={i} 
             className="absolute rounded-full bg-pink-400 opacity-20"
             style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               width: `${Math.random() * 8 + 2}px`,
               height: `${Math.random() * 8 + 2}px`,
               animation: `float-particle ${Math.random() * 10 + 10}s linear infinite`,
               boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(236,72,153,0.5)`
             }}
           />
         ))}
      </div>
      
      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">Sobre Nosotros</h1>
          <p className="text-[#cfa873] tracking-widest text-sm font-semibold uppercase mb-6 drop-shadow-md">Nuestra Esencia y Políticas</p>
          <motion.div 
            animate={{ width: ["0%", "50%", "0%"], opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto"
          />
        </motion.div>

        {/* Intro Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto mb-20 text-center relative"
        >
          {/* Glowing subtle background for text */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-900/10 to-transparent blur-3xl -z-10 rounded-full"></div>
          
          <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-8 font-light">
            <strong className="text-pink-400 font-serif text-2xl font-normal">YUNAN</strong> nació de la obsesión por crear piezas que no solo se vean bien, sino que proyecten seguridad, elegancia y exclusividad. No hacemos moda convencional; diseñamos prendas de alta gama para la mujer moderna que entiende que su presencia es su mejor carta de presentación.
          </p>
          <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-10 font-light">
            Cada prenda de nuestra colección es meticulosamente confeccionada y seleccionada con materiales de la más alta calidad, garantizando un entalle perfecto, durabilidad excepcional y una presencia deslumbrante. Bienvenida al siguiente nivel de la moda femenina.
          </p>
          
          <Link href="/">
            <button className="bg-transparent hover:bg-pink-500/10 border border-pink-500/50 text-pink-400 hover:text-white font-bold tracking-widest uppercase text-xs rounded-full px-10 py-4 transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]">
              Explorar la colección
            </button>
          </Link>
        </motion.div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-white mb-2">Guía Oficial de Atención</h2>
          <div className="w-12 h-0.5 bg-[#cfa873] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Números de Contacto */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={floatingAnimation}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
            <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-6"><Phone className="mr-3 h-5 w-5 animate-pulse" /> Números de Contacto</h3>
            <div className="relative space-y-6">
              <div className="group/item">
                <p className="text-zinc-400 text-sm mb-1 uppercase tracking-wider font-bold">Solicitar Recojo:</p>
                <p className="text-2xl font-serif text-white group-hover/item:text-pink-300 transition-colors">942 349 822</p>
                <p className="text-xs text-pink-300/70 mt-1">Límite: Hasta el sábado a las 1:00 p.m.</p>
              </div>
              <div className="group/item">
                <p className="text-zinc-400 text-sm mb-1 uppercase tracking-wider font-bold">Hacer Pedidos:</p>
                <p className="text-2xl font-serif text-white group-hover/item:text-pink-300 transition-colors">951 162 161</p>
              </div>
            </div>
          </motion.div>

          {/* Entregas Presenciales */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
            <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-6"><MapPin className="mr-3 h-5 w-5 group-hover:animate-bounce" /> Entregas Presenciales</h3>
            <div className="relative space-y-4 text-zinc-300">
              <p className="group-hover:translate-x-2 transition-transform duration-300"><strong className="text-white">Días:</strong> Domingos de 11:00 a.m. a 12:00 p.m.</p>
              <p className="group-hover:translate-x-2 transition-transform duration-300 delay-75"><strong className="text-white">Lugar:</strong> Plaza de Cajamarca.</p>
            </div>
          </motion.div>

          {/* Separaciones y Pago (Spans full width) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 group relative overflow-hidden bg-gradient-to-br from-pink-900/20 to-[#0a0508]/60 border border-pink-500/30 p-10 rounded-[2rem] backdrop-blur-xl text-center shadow-[0_0_50px_rgba(236,72,153,0.1)] hover:shadow-[0_0_60px_rgba(207,168,115,0.2)] transition-all duration-700"
          >
            {/* Animated glowing orb inside the card */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"
            />

            <h3 className="relative flex items-center justify-center text-[#cfa873] font-serif text-2xl mb-4 drop-shadow-md"><CreditCard className="mr-3 h-6 w-6 text-pink-400" /> Separaciones y Métodos de Pago</h3>
            <p className="relative text-zinc-300 mb-8 text-lg">La separación mínima es de S/ 5.00 mediante Yape.</p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative inline-block bg-[#050103] border border-[#cfa873]/50 rounded-2xl p-6 mb-8 shadow-[0_0_20px_rgba(207,168,115,0.15)] hover:shadow-[0_0_30px_rgba(207,168,115,0.3)] transition-shadow duration-300 cursor-pointer"
            >
              <p className="text-[#cfa873] font-bold text-4xl font-serif mb-2 flex items-center justify-center gap-4">
                <motion.img 
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Yape_text_app_icon.png/250px-Yape_text_app_icon.png" 
                  alt="Yape" 
                  className="h-10 object-contain rounded-lg shadow-lg" 
                  onError={(e) => e.currentTarget.style.display = 'none'} 
                />
                951 162 161
              </p>
              <p className="text-zinc-400 uppercase tracking-widest text-xs mt-2">A nombre de: <strong className="text-white text-sm">Yudith Arocutipa</strong></p>
            </motion.div>

            <div className="relative text-left max-w-2xl mx-auto space-y-4 text-zinc-300 bg-black/30 p-6 rounded-2xl border border-white/5">
              <p className="font-bold text-white mb-4 text-center">Opciones para abonar:</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group/li">
                  <span className="text-pink-500 mt-1 transition-transform group-hover/li:scale-125">✦</span>
                  <span>Separar tu prenda con el monto mínimo de <strong className="text-pink-400">S/ 5.00</strong>.</span>
                </li>
                <li className="flex items-start gap-3 group/li">
                  <span className="text-pink-500 mt-1 transition-transform group-hover/li:scale-125">✦</span>
                  <span>Pagar tu pedido en su totalidad.</span>
                </li>
                <li className="flex items-start gap-3 group/li">
                  <span className="text-pink-500 mt-1 transition-transform group-hover/li:scale-125">✦</span>
                  <span>Abonar el monto que desees, siempre que <strong className="text-pink-400">no sea menor a S/ 5.00</strong>.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Envíos a Provincias */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-4"><Truck className="mr-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" /> Envíos a Provincias</h3>
            <p className="relative text-zinc-300 mb-6">Se realizan envíos a nivel nacional con la agencia de tu preferencia.</p>
            <div className="relative bg-pink-500/10 border-l-2 border-pink-500 p-4 rounded-r-lg group-hover:bg-pink-500/20 transition-colors">
              <p className="text-sm text-pink-100"><strong className="text-pink-400">Costo Adicional:</strong> S/ 3.00 por cualquier tamaño de paquete.</p>
            </div>
          </motion.div>

          {/* Pedidos en Transmisiones */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.3 } }}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-4"><Camera className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> Pedidos en Live</h3>
            <p className="relative text-zinc-300 leading-relaxed">
              Toma una captura clara del modelo y envíala de inmediato al número de pedidos: <br/><strong className="text-white text-lg mt-2 inline-block drop-shadow-md">951 162 161</strong>.
            </p>
          </motion.div>

          {/* Tiempos Límite */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1.5 } }}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-4"><Clock className="mr-3 h-5 w-5 animate-pulse" /> Tiempos Límite</h3>
            <p className="relative text-zinc-300 mb-6">
              Plazo máximo de <strong className="text-white">30 días</strong> para cancelar el saldo restante y recoger tu pedido.
            </p>
            <div className="relative bg-yellow-500/10 border-l-2 border-yellow-500 p-4 rounded-r-lg group-hover:bg-yellow-500/20 transition-colors">
              <p className="text-sm text-yellow-100"><strong className="text-yellow-400">IMPORTANTE:</strong> Si no son pagadas o recogidas, serán liberadas sin derecho a devolución.</p>
            </div>
          </motion.div>

          {/* Cambios y Recargos */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.8 } }}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-4"><AlertTriangle className="mr-3 h-5 w-5 text-yellow-500 group-hover:text-pink-500 transition-colors" /> Cambios y Recargos</h3>
            <ul className="relative space-y-4 text-zinc-300">
              <li className="flex items-start gap-2"><span className="text-pink-500 mt-1">✗</span> No hay cambios ni devoluciones.</li>
              <li className="flex items-start gap-2"><span className="text-pink-500 mt-1">!</span> Adicional de <strong className="text-pink-400 mx-1">S/ 2.00 a S/ 3.00</strong> por falta de recojo en fecha.</li>
            </ul>
          </motion.div>
          
          {/* Liberación de Prendas & Reclamos (Combined for symmetry) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1.2 } }}
            className="group relative bg-[#0a0508]/60 border border-pink-500/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-pink-900/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] md:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-4"><ShieldCheck className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> Liberación de Prendas</h3>
                <p className="relative text-zinc-300 leading-relaxed">
                  Costo de <strong className="text-pink-400">S/ 5.00 por cada prenda</strong> si deseas liberar voluntariamente.
                </p>
              </div>
              <div>
                <h3 className="relative flex items-center text-pink-400 font-serif text-xl mb-4"><HeartHandshake className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> Reclamos</h3>
                <p className="relative text-zinc-300 leading-relaxed">
                  Únicamente el mismo día del recojo, con límite de hasta las <strong className="text-white">6:00 p.m. del domingo</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mt-24 mb-8"
        >
          <motion.p 
            animate={{ scale: [1, 1.02, 1], textShadow: ["0px 0px 10px rgba(207,168,115,0.2)", "0px 0px 20px rgba(207,168,115,0.6)", "0px 0px 10px rgba(207,168,115,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-[#cfa873] font-serif italic text-2xl md:text-3xl tracking-wide"
          >
            ✨ ¡Gracias por confiar en Yunan! Trabajamos para ayudarte a brillar bonito. ✨
          </motion.p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes float-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.3; }
          50% { transform: translateY(-50vh) scale(1.5); opacity: 0.5; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
