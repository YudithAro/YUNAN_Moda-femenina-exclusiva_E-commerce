"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import {
  categoryName,
  fetchProducts,
  money,
  Product,
  productOptions,
  productStock,
} from "@/lib/products";

const field =
  "w-full rounded-xl border border-white/15 bg-[#160c12] px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#cfa873]";
const action =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#cfa873] px-5 text-sm font-semibold text-[#170d12] transition-colors hover:bg-[#e3c193] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfa873]";

export function ProductCatalog({
  mode = "collection",
}: {
  mode?: "home" | "collection" | "new";
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 30000);
    let active = true;
    fetchProducts<Product[]>("/products", controller.signal)
      .then((data) => {
        if (!Array.isArray(data))
          throw new Error("Respuesta inesperada del catálogo.");
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active)
          setError(
            "No pudimos cargar la colección. Revisa tu conexión y vuelve a intentarlo.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
        clearTimeout(timeout);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  const categories = useMemo(
    () => [...new Set(products.map(categoryName))].sort(),
    [products],
  );
  const sizes = useMemo(
    () => [
      ...new Set(
        products.flatMap((product) => productOptions(product, "size")),
      ),
    ],
    [products],
  );
  const colors = useMemo(
    () =>
      [
        ...new Set(
          products.flatMap((product) => productOptions(product, "color")),
        ),
      ].sort(),
    [products],
  );
  const invalidRange =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);
  const results = useMemo(() => {
    let list = products.filter((product) => {
      if (
        !product.name
          .toLocaleLowerCase("es")
          .includes(search.trim().toLocaleLowerCase("es"))
      )
        return false;
      if (category && categoryName(product) !== category) return false;
      if (inStock && productStock(product) <= 0) return false;
      if (minPrice !== "" && Number(product.price) < Number(minPrice))
        return false;
      if (maxPrice !== "" && Number(product.price) > Number(maxPrice))
        return false;
      if (product.variants?.length && (size || color)) {
        return product.variants.some(
          (variant) =>
            (!size || variant.size === size) &&
            (!color || variant.color === color) &&
            Number(variant.stock) > 0,
        );
      }
      return (
        (!size || productOptions(product, "size").includes(size)) &&
        (!color || productOptions(product, "color").includes(color))
      );
    });
    list = [...list].sort((a, b) =>
      sort === "price-asc"
        ? Number(a.price) - Number(b.price)
        : sort === "price-desc"
          ? Number(b.price) - Number(a.price)
          : Date.parse(b.createdAt || "1970-01-01") -
            Date.parse(a.createdAt || "1970-01-01"),
    );
    return mode === "new" ? list.slice(0, 12) : list;
  }, [
    products,
    search,
    category,
    size,
    color,
    minPrice,
    maxPrice,
    sort,
    inStock,
    mode,
  ]);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setSize("");
    setColor("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
  }
  function retry() {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  }

  return (
    <div className="min-h-screen bg-[#050103] text-white selection:bg-[#cfa873] selection:text-black">
      <header
        className={`border-b border-white/10 bg-gradient-to-br from-[#21101b] via-[#0c0509] to-[#050103] px-4 ${mode === "home" ? "py-12 md:py-16" : "py-10 md:py-14"}`}
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#cfa873]">
            YUNAN · Moda femenina
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            {mode === "home" ? (
              <>
                Tu estilo, <span className="text-[#cfa873]">tu esencia.</span>
              </>
            ) : mode === "new" ? (
              "Nuevos ingresos"
            ) : (
              "Nuestra colección"
            )}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300">
            {mode === "home"
              ? "Descubre prendas para sentirte tú. Elige tu favorita, talla y color; te atendemos por WhatsApp."
              : mode === "new"
                ? "Explora las últimas prendas que llegaron a YUNAN."
                : "Encuentra tu próxima prenda favorita por colección, talla y color."}
          </p>
          {mode === "home" && (
            <a href="#catalogo" className={`${action} mt-6`}>
              Explorar colección <ArrowRight size={17} />
            </a>
          )}
        </div>
      </header>
      <section
        id="catalogo"
        aria-label="Catálogo de prendas"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 md:py-12"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">
            {mode === "new" ? "Lo último de YUNAN" : "Encuentra tu favorita"}
          </h2>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            Ordenar
            <select
              aria-label="Ordenar prendas"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={`${field} max-w-48`}
            >
              <option value="newest">Más recientes</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </label>
        </div>
        <div className="mb-7 space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:p-5">
          <label className="relative block">
            <span className="sr-only">Buscar prendas</span>
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-zinc-400"
            />
            <input
              className={`${field} pl-10`}
              placeholder="Busca una prenda..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-sm text-[#e3c193]">
              <SlidersHorizontal size={16} /> Filtros de colección, talla y
              precio{" "}
              <span className="ml-auto text-xs text-zinc-400">
                Mostrar / ocultar
              </span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <label className="space-y-2 text-xs text-zinc-300">
                <span>Colección</span>
                <select
                  aria-label="Colección"
                  className={field}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">Todas</option>
                  {categories.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-xs text-zinc-300">
                <span>Talla</span>
                <select
                  aria-label="Talla"
                  className={field}
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                >
                  <option value="">Todas</option>
                  {sizes.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-xs text-zinc-300">
                <span>Color</span>
                <select
                  aria-label="Color"
                  className={field}
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                >
                  <option value="">Todos</option>
                  {colors.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-xs text-zinc-300">
                <span>Precio mínimo (S/)</span>
                <input
                  className={field}
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Desde"
                />
              </label>
              <label className="space-y-2 text-xs text-zinc-300">
                <span>Precio máximo (S/)</span>
                <input
                  className={field}
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Hasta"
                />
              </label>
            </div>
          </details>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
            <label className="flex items-center gap-2 text-zinc-300">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => setInStock(event.target.checked)}
                className="h-4 w-4 accent-[#cfa873]"
              />{" "}
              Solo disponibles
            </label>
            <button
              onClick={resetFilters}
              className="min-h-10 px-2 text-[#e3c193] underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        {invalidRange && (
          <p role="alert" className="mb-5 text-sm text-rose-300">
            El precio mínimo no puede ser mayor que el máximo.
          </p>
        )}
        {loading ? (
          <div
            role="status"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <span className="sr-only">Cargando colección...</span>
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[3/4] rounded-t-2xl bg-white/5" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-5 w-1/2 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-400/30 p-8 text-center"
          >
            <h3 className="font-serif text-2xl">
              La colección no está disponible ahora
            </h3>
            <p className="mx-auto my-4 max-w-lg text-zinc-300">{error}</p>
            <button className={action} onClick={retry}>
              Volver a intentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <h3 className="font-serif text-2xl">
              Estamos preparando la colección
            </h3>
            <p className="my-4 text-zinc-300">
              Pronto encontrarás nuevas prendas aquí.
            </p>
            <button onClick={retry} className={action}>
              Actualizar catálogo
            </button>
          </div>
        ) : results.length === 0 || invalidRange ? (
          <div className="py-16 text-center">
            <h3 className="font-serif text-2xl">
              No encontramos prendas con esos filtros
            </h3>
            <p className="my-4 text-zinc-300">
              Prueba otra talla, colección o rango de precio.
            </p>
            <button onClick={resetFilters} className={action}>
              Ver todas las prendas
            </button>
          </div>
        ) : (
          <>
            <p aria-live="polite" className="mb-4 text-sm text-zinc-400">
              {results.length}{" "}
              {mode === "new"
                ? results.length === 1
                  ? "prenda reciente"
                  : "prendas más recientes"
                : results.length === 1
                  ? "prenda encontrada"
                  : "prendas encontradas"}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
              {results.map((product, index) => (
                <article
                  key={product.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e070b] transition-colors hover:border-[#cfa873]/50"
                >
                  <Link
                    href={`/producto/${product.id}`}
                    className="relative block aspect-[3/4] overflow-hidden"
                    aria-label={`Ver ${product.name}`}
                  >
                    <ProductImage
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                      preload={index < 2}
                    />
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${productStock(product) > 0 ? "bg-[#050103]/85 text-white" : "bg-rose-950/90 text-rose-100"}`}
                    >
                      {productStock(product) > 0 ? "Disponible" : "Agotado"}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#cfa873]">
                      {categoryName(product)}
                    </p>
                    <h3 className="font-serif text-lg leading-snug">
                      <Link href={`/producto/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-base font-medium text-[#e3c193]">
                      {money(product.price)}
                    </p>
                    <p className="mb-2 text-xs leading-relaxed text-zinc-400">
                      {productOptions(product, "size").join(" · ") ||
                        "Consulta los detalles"}
                    </p>
                    <Link
                      href={`/producto/${product.id}`}
                      className="mt-auto flex min-h-11 items-center justify-center rounded-xl border border-[#cfa873]/50 px-2 text-center text-xs font-semibold text-[#e3c193] transition-colors hover:bg-[#cfa873] hover:text-black"
                    >
                      {productStock(product) > 0
                        ? "Elegir talla y color"
                        : "Ver detalles"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
        <p className="font-serif text-xl text-[#cfa873]">YUNAN</p>
        <p className="mt-2">
          Moda femenina · Atención personalizada por WhatsApp
        </p>
        <Link
          href="/nosotros"
          className="mt-3 inline-block min-h-10 py-2 text-zinc-200 underline underline-offset-4"
        >
          Conoce nuestra tienda
        </Link>
      </footer>
    </div>
  );
}
