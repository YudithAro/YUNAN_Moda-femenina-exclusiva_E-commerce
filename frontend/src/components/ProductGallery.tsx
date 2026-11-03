"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ZoomIn, ZoomOut } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const next = (direction: number) => { setIndex(value => (value + direction + images.length) % images.length); setZoomed(false); };
  const navigation = (direction: number) => <button type="button" aria-label={direction < 0 ? "Fotografía anterior" : "Fotografía siguiente"} onClick={() => next(direction)}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-stone-800 shadow-sm">
    {direction < 0 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
  </button>;
  return <div className="min-w-0">
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#ede9e3]">
      <button type="button" disabled={!images.length} aria-label={`Ampliar fotografía de ${name}`} onClick={() => { setZoomed(false); setExpanded(true); }} className="absolute inset-0 h-full w-full focus-visible:outline-4 focus-visible:outline-inset focus-visible:outline-[#cfac78]">
        <ProductImage src={images[index]} alt={`${name}, fotografía ${index + 1}`} sizes="(max-width: 767px) 100vw, 50vw" preload className="p-2" />
        {images.length > 0 && <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-stone-800"><Expand size={15} /> Ampliar</span>}
      </button>
      {images.length > 1 && <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between"><span className="pointer-events-auto">{navigation(-1)}</span><span className="pointer-events-auto">{navigation(1)}</span></div>}
    </div>
    {images.length > 1 && <div aria-label="Fotografías de la prenda" className="mt-3 flex gap-3 overflow-x-auto py-1">
      {images.map((image, position) => <button key={image + position} type="button" aria-label={`Ver fotografía ${position + 1} de ${name}`} aria-pressed={index === position} onClick={() => setIndex(position)}
        className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#ede9e3] outline-offset-2 ${index === position ? "ring-2 ring-[#cfac78]" : "opacity-65 hover:opacity-100"}`}>
        <ProductImage src={image} alt="" sizes="80px" className="p-1" />
      </button>)}
    </div>}
    <p className="mt-3 text-center text-xs text-zinc-400">{images.length > 0 ? `Fotografía ${index + 1} de ${images.length}. Toca la imagen para verla de cerca.` : "Nuestro equipo puede ayudarte con más información."}</p>
    <Dialog open={expanded} onOpenChange={setExpanded}>
      <DialogContent className="max-h-[95dvh] w-[calc(100%-1rem)] max-w-none gap-3 bg-[#171215] p-4 sm:max-w-5xl">
        <DialogHeader className="pr-9"><DialogTitle>{name}</DialogTitle><DialogDescription>Fotografía {index + 1} de {images.length}. {zoomed ? "Desliza para explorar la imagen ampliada." : "Amplía la fotografía para revisar los detalles."}</DialogDescription></DialogHeader>
        <div className="relative h-[65dvh] overflow-auto rounded-xl bg-[#ede9e3]" onKeyDown={event => {
          if (event.key === "ArrowLeft") { event.preventDefault(); next(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); next(1); }
        }} tabIndex={0} aria-label="Vista ampliada de la prenda">
          <div className={`relative ${zoomed ? "h-[130dvh] w-[200%]" : "h-full w-full"}`}>
            <ProductImage src={images[index]} alt={`${name}, fotografía ampliada ${index + 1}`} sizes={zoomed ? "150vw" : "(max-width: 767px) 100vw, 960px"} className="p-2" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" aria-pressed={zoomed} onClick={() => setZoomed(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm">
            {zoomed ? <ZoomOut size={17} /> : <ZoomIn size={17} />}{zoomed ? "Reducir" : "Ampliar"}
          </button>
          {images.length > 1 && <div className="flex gap-3">{navigation(-1)}{navigation(1)}</div>}
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}
