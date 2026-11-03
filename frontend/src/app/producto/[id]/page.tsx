"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, MessageCircle, Minus, Plus, Ruler, Truck } from "lucide-react";
import { ProductGallery } from "@/components/ProductGallery";
import { ColorSwatch } from "@/components/ColorSwatch";
import { StoreBackdrop } from "@/components/StoreBackdrop";
import { categoryName, fetchProducts, money, type Product, productOptions, productStock, whatsappLink } from "@/lib/products";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetail key={id} id={id} />;
}

function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let active = true;
    fetchProducts<Product>(`/products/${encodeURIComponent(id)}`, controller.signal)
      .then(data => { if (!data?.id) throw new Error("NOT_FOUND"); if (active) setProduct(data); })
      .catch(reason => { if (active) setError(reason instanceof Error && reason.message === "NOT_FOUND" ? "NOT_FOUND" : "CONNECTION"); })
      .finally(() => { if (active) setLoading(false); clearTimeout(timeout); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [id, attempt]);

  const secondary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-medium text-white hover:bg-white/5";
  const retry = () => { setLoading(true); setError(""); setAttempt(value => value + 1); };
  if (loading) return <div role="status" className="mx-auto max-w-7xl px-4 py-10">
    <p className="mb-6 text-sm text-zinc-300">Cargando detalles de la prenda...</p>
    <div className="grid animate-pulse gap-8 md:grid-cols-2"><div className="aspect-[3/4] rounded-2xl bg-white/10" /><div className="space-y-6 py-8"><div className="h-10 rounded bg-white/10" /><div className="h-6 w-1/3 rounded bg-white/10" /><div className="h-52 rounded bg-white/10" /></div></div>
  </div>;
  if (error || !product) return <div role="alert" className="mx-auto max-w-xl px-4 py-20 text-center">
    <h1 className="font-serif text-3xl">{error === "NOT_FOUND" ? "Prenda no encontrada" : "No pudimos cargar esta prenda"}</h1>
    <p className="my-5 text-zinc-300">{error === "NOT_FOUND" ? "Explora otras opciones de nuestra colección." : "Revisa tu conexión y vuelve a intentarlo."}</p>
    <div className="flex flex-wrap justify-center gap-3">{error !== "NOT_FOUND" && <button onClick={retry} className={secondary}>Volver a intentar</button>}<Link href="/coleccion" className={secondary}>Ver colección</Link></div>
  </div>;

  const variants = product.variants || [];
  const sizes = productOptions(product, "size");
  const colors = productOptions(product, "color");
  const requiresSize = sizes.length > 0;
  const requiresColor = colors.length > 0;
  const complete = (!requiresSize || !!selectedSize) && (!requiresColor || !!selectedColor);
  const selected = variants.find(variant => (!requiresSize || variant.size === selectedSize) && (!requiresColor || variant.color === selectedColor));
  const overallStock = productStock(product);
  const stock = variants.length ? Number(selected?.stock || 0) : overallStock;
  const requestedQuantity = Math.min(quantity, Math.max(stock, 1));
  const canBuy = complete && stock > 0;
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const subtotal = money(Number(product.price) * requestedQuantity);
  const unavailableSize = (size: string) => variants.length > 0 && !variants.some(variant => variant.size === size && Number(variant.stock) > 0);
  const unavailableColor = (color: string) => variants.length > 0 && !variants.some(variant => variant.color === color && (!selectedSize || variant.size === selectedSize) && Number(variant.stock) > 0);

  function chooseSize(size: string) {
    setSelectedSize(size); setQuantity(1);
    if (variants.length && selectedColor && !variants.some(variant => variant.size === size && variant.color === selectedColor && Number(variant.stock) > 0)) setSelectedColor("");
  }
  function buy() {
    if (overallStock <= 0 || !product) return;
    if (!complete) {
      setTried(true);
      const field = document.getElementById(requiresSize && !selectedSize ? "product-sizes" : "product-colors");
      field?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      field?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    if (!canBuy) return;
    window.open(whatsappLink(product, { size: selectedSize, color: selectedColor, quantity: requestedQuantity, url: window.location.href.split("?")[0].split("#")[0] }), "_blank", "noopener,noreferrer");
  }
  const purchaseDisabled = overallStock <= 0 || (complete && stock <= 0);
  const purchaseLabel = overallStock <= 0 ? "Prenda agotada" : !complete ? "Elegir opciones" : stock <= 0 ? "Sin disponibilidad" : "Comprar por WhatsApp";
  const selectionText = [selectedSize && `Talla ${selectedSize}`, selectedColor].filter(Boolean).join(" · ");
  const purchaseClass = "min-h-14 items-center justify-center gap-2 rounded-xl bg-[#cfac78] px-4 text-sm font-semibold text-[#19120c] transition-colors hover:bg-[#e1c396] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac78] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-400";

  return <div className="relative isolate min-h-screen bg-[#030001] px-4 pb-36 pt-5 text-white md:pb-14 md:pt-7">
    <StoreBackdrop />
    <div className="relative z-10 mx-auto max-w-7xl">
      <Link href="/coleccion" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-300 hover:text-white"><ArrowLeft size={16} />Volver a la colección</Link>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="mx-auto w-full min-w-0 max-w-[510px] md:sticky md:top-28"><ProductGallery images={images} name={product.name} /></div>
        <div className="min-w-0 py-1">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-zinc-400">{categoryName(product)}</span><span aria-hidden="true" className="h-1 w-1 rounded-full bg-zinc-600" />
            <span className={overallStock > 0 ? "text-emerald-300" : "text-rose-300"}>{overallStock > 0 ? "Disponible" : "Agotado"}</span>
          </div>
          <h1 className="font-serif text-3xl leading-tight md:text-4xl lg:text-5xl">{product.name}</h1>
          <p className="mb-6 mt-4 text-3xl font-medium tracking-tight">{money(product.price)}</p>
          {product.description && <p className="whitespace-pre-line text-sm leading-7 text-zinc-300 md:text-base">{product.description}</p>}

          {requiresSize && <fieldset id="product-sizes" className="mt-8 scroll-mt-28" aria-describedby={tried && !selectedSize ? "product-size-error" : undefined}>
            <legend className="mb-3 text-sm font-medium">Talla {selectedSize && <span className="ml-2 font-normal text-zinc-400">{selectedSize}</span>}</legend>
            <div className="flex flex-wrap gap-2">{sizes.map(size => <button key={size} type="button" disabled={unavailableSize(size)} aria-pressed={selectedSize === size} onClick={() => chooseSize(size)}
              className={`min-h-12 min-w-14 rounded-xl border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through ${selectedSize === size ? "border-white bg-white text-stone-900" : "border-white/20 hover:border-white/60"}`}>{size}</button>)}</div>
            {tried && !selectedSize && <p id="product-size-error" role="alert" className="mt-2 text-sm text-rose-300">Elige una talla disponible.</p>}
          </fieldset>}
          {requiresColor && <fieldset id="product-colors" className="mt-6 scroll-mt-28" aria-describedby={tried && !selectedColor ? "product-color-error" : undefined}>
            <legend className="mb-3 text-sm font-medium">Color {selectedColor && <span className="ml-2 font-normal text-zinc-400">{selectedColor}</span>}</legend>
            <div className="flex flex-wrap gap-2">{colors.map(color => <button key={color} type="button" disabled={unavailableColor(color)} aria-pressed={selectedColor === color}
              onClick={() => { setSelectedColor(color); setQuantity(1); }}
              className={`inline-flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-30 ${selectedColor === color ? "border-white bg-white/10" : "border-white/20 hover:border-white/60"}`}>
              <ColorSwatch color={color} />{color}{selectedColor === color && <Check size={15} />}
            </button>)}</div>
            {tried && !selectedColor && <p id="product-color-error" role="alert" className="mt-2 text-sm text-rose-300">Elige un color disponible.</p>}
            <p className="mt-3 text-xs leading-5 text-zinc-400">Las muestras de color son referenciales. Revisa las fotografías de la prenda.</p>
          </fieldset>}

          <details className="mt-7 border-y border-white/10 py-4">
            <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm text-zinc-200"><Ruler size={17} />¿Necesitas ayuda con la talla?<Plus size={15} className="ml-auto" /></summary>
            <p className="mt-3 text-sm leading-7 text-zinc-300">El calce varía según la prenda y la tela. Escríbenos con tus medidas para ayudarte a elegir antes de comprar.</p>
          </details>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <label id="quantity-label" className="text-sm font-medium">Cantidad</label>
            <div className="flex items-center rounded-xl border border-white/20" role="group" aria-labelledby="quantity-label">
              <button type="button" aria-label="Reducir cantidad" disabled={requestedQuantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))} className="flex h-12 w-12 items-center justify-center hover:bg-white/5 disabled:opacity-25"><Minus size={16} /></button>
              <output aria-live="polite" className="w-10 text-center text-sm">{requestedQuantity}</output>
              <button type="button" aria-label="Aumentar cantidad" disabled={!complete || requestedQuantity >= stock} onClick={() => setQuantity(value => value + 1)} className="flex h-12 w-12 items-center justify-center hover:bg-white/5 disabled:opacity-25"><Plus size={16} /></button>
            </div>
          </div>
          <p aria-live="polite" className="mt-4 min-h-10 text-sm leading-6 text-zinc-300">
            {overallStock <= 0 ? "Esta prenda está agotada por el momento." : !complete ? "Elige las opciones de tu prenda para continuar."
              : stock <= 0 ? "Esta combinación está agotada. Elige otra opción." : variants.length ? `${stock} ${stock === 1 ? "unidad disponible" : "unidades disponibles"} de esta combinación.` : "Confirmaremos la disponibilidad de talla y color por WhatsApp."}
          </p>
          <div className="mb-4 mt-5 hidden items-center justify-between border-t border-white/10 pt-5 md:flex"><span className="text-sm text-zinc-300">Subtotal</span><strong className="text-xl font-semibold">{subtotal}</strong></div>
          <button type="button" onClick={buy} disabled={purchaseDisabled} className={`${purchaseClass} hidden w-full md:flex`}><MessageCircle size={19} />{purchaseLabel}</button>
          <p className="mt-4 text-sm leading-6 text-zinc-400">El mensaje incluirá tu selección y el subtotal. El pedido y el pago se confirman con nuestro equipo.</p>
          <div className="mt-7 flex items-start gap-3 border-t border-white/10 pt-5 text-sm leading-7 text-zinc-300"><Truck size={19} className="mt-1 shrink-0 text-zinc-400" /><p>Consulta las opciones, costo y plazo de envío según tu destino antes de confirmar.</p></div>
        </div>
      </div>
    </div>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-[#151014]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden" aria-label="Compra de la prenda">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <div className="min-w-20"><p className="text-xs text-zinc-400">Subtotal</p><p className="mt-1 whitespace-nowrap text-lg font-semibold">{subtotal}</p></div>
        <button type="button" onClick={buy} disabled={purchaseDisabled} className={`${purchaseClass} flex min-w-0 flex-1`}><MessageCircle size={18} className="shrink-0" /><span>{purchaseLabel}</span></button>
      </div>
      {selectionText && <p className="mx-auto mt-2 max-w-7xl truncate text-center text-xs text-zinc-300">{selectionText} · {requestedQuantity} {requestedQuantity === 1 ? "unidad" : "unidades"}</p>}
    </div>
  </div>;
}
