"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { StoreBackdrop } from "@/components/StoreBackdrop";
import { CatalogFilters, catalogField, emptySelection, type CatalogSelection } from "@/components/CatalogFilters";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { categoryName, fetchProducts, money, type Product, productOptions, productStock } from "@/lib/products";

const action = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#cfac78] px-5 text-sm font-semibold text-[#19120c] transition-colors hover:bg-[#e1c396] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac78]";

export function ProductCatalog({ mode = "collection" }: { mode?: "home" | "collection" | "new" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogSelection>(emptySelection);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let active = true;
    fetchProducts<Product[]>("/products", controller.signal)
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Invalid catalog");
        if (active) setProducts(data);
      })
      .catch(() => { if (active) setError("No pudimos cargar las prendas. Revisa tu conexión e inténtalo nuevamente."); })
      .finally(() => { if (active) setLoading(false); clearTimeout(timeout); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  const categories = useMemo(() => [...new Set(products.map(categoryName))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap(product => productOptions(product, "size")))], [products]);
  const colors = useMemo(() => [...new Set(products.flatMap(product => productOptions(product, "color")))].sort(), [products]);
  const invalidRange = filters.minPrice !== "" && filters.maxPrice !== "" && Number(filters.minPrice) > Number(filters.maxPrice);
  const results = useMemo(() => {
    if (invalidRange) return [];
    const query = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const list = products.filter(product => {
      const name = product.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (!name.includes(query) || (filters.category && categoryName(product) !== filters.category)) return false;
      if (filters.inStock && productStock(product) <= 0) return false;
      if (filters.minPrice !== "" && Number(product.price) < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== "" && Number(product.price) > Number(filters.maxPrice)) return false;
      if (product.variants?.length && (filters.size || filters.color)) return product.variants.some(variant =>
        (!filters.size || variant.size === filters.size) && (!filters.color || variant.color === filters.color) && Number(variant.stock) > 0);
      return (!filters.size || productOptions(product, "size").includes(filters.size)) && (!filters.color || productOptions(product, "color").includes(filters.color));
    });
    list.sort((a, b) => sort === "price-asc" ? Number(a.price) - Number(b.price)
      : sort === "price-desc" ? Number(b.price) - Number(a.price)
      : Date.parse(b.createdAt || "1970-01-01") - Date.parse(a.createdAt || "1970-01-01"));
    return mode === "new" ? list.slice(0, 12) : list;
  }, [products, search, filters, sort, invalidRange, mode]);

  const chips = [
    ...(search.trim() ? [{ label: `Búsqueda: ${search.trim()}`, clear: () => setSearch("") }] : []),
    ...(filters.category ? [{ label: filters.category, clear: () => setFilters({ ...filters, category: "" }) }] : []),
    ...(filters.size ? [{ label: `Talla ${filters.size}`, clear: () => setFilters({ ...filters, size: "" }) }] : []),
    ...(filters.color ? [{ label: filters.color, clear: () => setFilters({ ...filters, color: "" }) }] : []),
    ...(filters.minPrice || filters.maxPrice ? [{ label: `${filters.minPrice ? money(filters.minPrice) : "S/ 0"} – ${filters.maxPrice ? money(filters.maxPrice) : "sin límite"}`, clear: () => setFilters({ ...filters, minPrice: "", maxPrice: "" }) }] : []),
    ...(filters.inStock ? [{ label: "Solo disponibles", clear: () => setFilters({ ...filters, inStock: false }) }] : []),
  ];
  const reset = () => { setFilters(emptySelection); setSearch(""); };
  const retry = () => { setLoading(true); setError(""); setAttempt(value => value + 1); };
  return <div className="relative isolate min-h-screen bg-[#030001] text-white selection:bg-[#cfac78] selection:text-black">
    <StoreBackdrop />
    <header className={`relative z-10 border-b border-white/5 px-4 ${mode === "home" ? "py-12 md:py-16" : "py-9 md:py-11"}`}>
      {mode === "home" ? <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <Image src="/logo-yunan2.png" alt="Logo de YUNAN" width={160} height={160} preload
          className="h-28 w-28 rounded-full border border-[#cfa873]/25 object-cover shadow-[0_0_50px_rgba(207,168,115,0.18)] sm:h-36 sm:w-36" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#cfa873]">Exclusividad &amp; elegancia</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl md:text-7xl">
          <span className="block font-light text-white">COLECCIÓN</span>
          <span className="block bg-gradient-to-r from-[#e3c193] via-[#cfa873] to-[#a38051] bg-clip-text text-transparent">PREMIUM</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 md:text-base">Prendas únicas para sentirte tú, con belleza, seguridad y estilo.</p>
        <a href="#catalogo" className={`${action} mt-6`}>Ver catálogo <ArrowRight size={17} /></a>
      </div> : <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-medium text-zinc-400">YUNAN · Moda femenina</p>
        <h1 className="font-serif text-4xl leading-tight md:text-5xl">{mode === "new" ? "Nuevos ingresos" : "Nuestra colección"}</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 md:text-base">{mode === "new" ? "Descubre las últimas prendas que llegaron a YUNAN." : "Explora las prendas, encuentra tu talla y consulta con nuestro equipo."}</p>
      </div>}
    </header>

    <section id="catalogo" aria-label="Catálogo de prendas" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-7 md:py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-serif text-2xl md:text-3xl">{mode === "new" ? "Lo último de YUNAN" : "Encuentra tu favorita"}</h2>
          <p aria-live="polite" className="mt-2 text-sm text-zinc-400">{loading ? "Preparando la colección..." : error ? "Intenta cargar la colección nuevamente." : `${results.length} ${results.length === 1 ? "prenda" : "prendas"}`}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300">Ordenar
          <select aria-label="Ordenar prendas" value={sort} onChange={event => setSort(event.target.value)} className={`${catalogField} max-w-44`}>
            <option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option>
          </select>
        </label>
      </div>

      <div className="mb-5 flex gap-3">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Buscar prendas</span><Search size={18} className="pointer-events-none absolute left-4 top-4 text-zinc-400" />
          <input className={`${catalogField} pl-11`} type="search" placeholder="Busca una prenda..." value={search} onChange={event => setSearch(event.target.value)} />
        </label>
        <button type="button" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-medium md:hidden">
          <SlidersHorizontal size={17} /> Filtrar {chips.length > 0 && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{chips.length}</span>}
        </button>
      </div>
      <div className="mb-5 hidden rounded-2xl border border-white/10 p-5 md:block">
        <CatalogFilters value={filters} onChange={setFilters} categories={categories} sizes={sizes} colors={colors} prefix="desktop" />
      </div>
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="bottom-0 left-0 top-auto max-h-[90dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-b-none rounded-t-3xl bg-[#151014] p-5 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Encuentra tu prenda</DialogTitle><DialogDescription>Combina colección, talla, color y precio.</DialogDescription></DialogHeader>
          <CatalogFilters value={filters} onChange={setFilters} categories={categories} sizes={sizes} colors={colors} prefix="mobile" />
          <div className="sticky bottom-0 -mx-5 -mb-5 mt-2 flex gap-3 border-t border-white/10 bg-[#151014] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <button type="button" onClick={reset} className="min-h-12 rounded-xl border border-white/20 px-4 text-sm">Limpiar</button>
            <button type="button" disabled={invalidRange} onClick={() => setFiltersOpen(false)} className={`${action} flex-1 disabled:opacity-40`}>Ver {results.length} {results.length === 1 ? "prenda" : "prendas"}</button>
          </div>
        </DialogContent>
      </Dialog>
      {chips.length > 0 && <div aria-label="Filtros seleccionados" className="mb-6 flex flex-wrap items-center gap-2">
        {chips.map(chip => <button key={chip.label} type="button" onClick={chip.clear} aria-label={`Quitar filtro ${chip.label}`} className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-sm text-zinc-200">
          <span className="max-w-56 truncate">{chip.label}</span><X size={14} className="shrink-0" />
        </button>)}
        <button type="button" onClick={reset} className="min-h-10 px-2 text-sm text-zinc-300 underline underline-offset-4">Limpiar todo</button>
      </div>}

      {loading ? <div role="status" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <span className="sr-only">Cargando colección...</span>
        {Array.from({ length: 8 }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[3/4] rounded-2xl bg-white/10" /><div className="mt-4 h-5 w-3/4 rounded bg-white/10" /><div className="mt-3 h-5 w-1/2 rounded bg-white/10" /></div>)}
      </div> : error ? <div role="alert" className="rounded-2xl border border-rose-400/30 px-6 py-12 text-center">
        <h3 className="font-serif text-2xl">No pudimos mostrar la colección</h3><p className="mx-auto my-4 max-w-lg text-zinc-300">{error}</p><button className={action} onClick={retry}>Volver a intentar</button>
      </div> : products.length === 0 ? <div className="py-16 text-center">
        <h3 className="font-serif text-2xl">Estamos preparando la colección</h3><p className="my-4 text-zinc-300">Pronto encontrarás nuevas prendas aquí.</p><button onClick={retry} className={action}>Actualizar catálogo</button>
      </div> : results.length === 0 ? <div className="rounded-2xl border border-white/10 py-14 text-center">
        <Search className="mx-auto mb-4 text-zinc-500" size={28} /><h3 className="font-serif text-2xl">{invalidRange ? "Revisa el rango de precio" : "No encontramos prendas con esos filtros"}</h3>
        <p className="my-4 text-sm text-zinc-300">{invalidRange ? "El precio mínimo no puede superar el máximo." : "Prueba otra talla, colección o rango de precio."}</p><button onClick={reset} className={action}>Ver todas las prendas</button>
      </div> : <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {results.map((product, index) => {
          const available = productStock(product) > 0;
          const images = product.images?.length ? product.images : product.image ? [product.image] : [];
          const availableSizes = product.variants?.length ? [...new Set(product.variants.filter(variant => Number(variant.stock) > 0).map(variant => variant.size).filter(Boolean))] : productOptions(product, "size");
          return <article key={product.id} className="product-card group min-w-0">
            <Link href={`/producto/${product.id}`} aria-label={`Ver ${product.name}`} className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-[#140b10] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfac78]">
              <ProductImage src={images[0]} alt={product.name} sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw" preload={index < 2} fit="cover" className="object-center transition-transform duration-500 group-hover:scale-[1.025]" />
              {images[1] && <div className="product-secondary-image absolute inset-0 bg-[#140b10]"><ProductImage src={images[1]} alt={`${product.name}, segunda vista`} sizes="(max-width: 767px) 50vw, 25vw" fit="cover" className="object-center" /></div>}
              <span className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${available ? "bg-white/95 text-stone-800" : "bg-stone-900/90 text-white"}`}>
                {available && <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />}{available ? "Disponible" : "Agotado"}
              </span>
              {images.length > 1 && <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs text-stone-700"><ImageIcon size={12} />{images.length} vistas</span>}
            </Link>
            <div className="pt-3.5">
              <p className="mb-1 text-xs text-zinc-400">{categoryName(product)}</p>
              <h3 className="min-h-12 font-serif text-lg leading-6 md:text-xl"><Link href={`/producto/${product.id}`} className="line-clamp-2 hover:underline">{product.name}</Link></h3>
              <p className="mt-2 text-lg font-semibold tracking-tight text-white">{money(product.price)}</p>
              <p className="mt-2 min-h-5 text-xs text-zinc-300">{!available ? "Sin existencias por el momento" : availableSizes.length ? `Tallas ${availableSizes.join(" · ")}` : "Consulta los detalles"}</p>
              <Link href={`/producto/${product.id}`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-100 underline decoration-white/25 underline-offset-4 hover:decoration-white">
                {available ? "Elegir mi prenda" : "Ver detalles"}<ArrowRight size={15} />
              </Link>
            </div>
          </article>;
        })}
      </div>}
    </section>
    <footer className="relative z-10 border-t border-white/10 bg-[#050103]/60 px-4 py-9">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-zinc-300 sm:flex-row sm:items-center">
        <div><p className="font-serif text-2xl text-white">YUNAN</p><p className="mt-2">Moda femenina · Atención por WhatsApp</p></div>
        <Link href="/nosotros" className="min-h-11 py-3 underline underline-offset-4">Conoce nuestra tienda y condiciones</Link>
      </div>
    </footer>
  </div>;
}
