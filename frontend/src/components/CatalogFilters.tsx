"use client";

import { ColorSwatch } from "@/components/ColorSwatch";

export type CatalogSelection = { category: string; size: string; color: string; minPrice: string; maxPrice: string; inStock: boolean };
export const emptySelection: CatalogSelection = { category: "", size: "", color: "", minPrice: "", maxPrice: "", inStock: false };
export const catalogField = "min-h-12 w-full rounded-xl border border-white/15 bg-[#171215] px-3 text-sm text-white outline-none focus:border-[#cfac78] focus:ring-2 focus:ring-[#cfac78]/25";

export function CatalogFilters({ value, onChange, categories, sizes, colors, prefix }: {
  value: CatalogSelection; onChange: (value: CatalogSelection) => void;
  categories: string[]; sizes: string[]; colors: string[]; prefix: string;
}) {
  const invalid = value.minPrice !== "" && value.maxPrice !== "" && Number(value.minPrice) > Number(value.maxPrice);
  const change = <K extends keyof CatalogSelection>(key: K, next: CatalogSelection[K]) => onChange({ ...value, [key]: next });
  return <div className="space-y-6">
    <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
      <label className="grid gap-2 text-sm text-zinc-200" htmlFor={prefix + "-category"}>Colección
        <select id={prefix + "-category"} aria-label="Colección" className={catalogField} value={value.category} onChange={event => change("category", event.target.value)}>
          <option value="">Todas las colecciones</option>
          {categories.map(name => <option key={name}>{name}</option>)}
        </select>
      </label>
      <fieldset className="md:hidden">
        <legend className="mb-3 text-sm text-zinc-200">Talla</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!value.size} onClick={() => change("size", "")} className={`filter-choice ${!value.size ? "filter-choice-active" : ""}`}>Todas</button>
          {sizes.map(name => <button key={name} type="button" aria-pressed={value.size === name} onClick={() => change("size", name)}
            className={`filter-choice ${value.size === name ? "filter-choice-active" : ""}`}>{name}</button>)}
        </div>
      </fieldset>
      <label className="hidden gap-2 text-sm text-zinc-200 md:grid" htmlFor={prefix + "-size"}>Talla
        <select id={prefix + "-size"} aria-label="Talla" className={catalogField} value={value.size} onChange={event => change("size", event.target.value)}>
          <option value="">Todas las tallas</option>{sizes.map(name => <option key={name}>{name}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-zinc-200" htmlFor={prefix + "-color"}>Color
        <span className="relative block">
          {value.color && <ColorSwatch color={value.color} className="pointer-events-none absolute left-3 top-3.5" />}
          <select id={prefix + "-color"} aria-label="Color" className={`${catalogField} ${value.color ? "pl-11" : ""}`} value={value.color} onChange={event => change("color", event.target.value)}>
            <option value="">Todos los colores</option>{colors.map(name => <option key={name}>{name}</option>)}
          </select>
        </span>
      </label>
      <label className="grid gap-2 text-sm text-zinc-200" htmlFor={prefix + "-minimum"}>Desde (S/)
        <input id={prefix + "-minimum"} className={catalogField} type="number" min="0" step="0.01" placeholder="0.00" value={value.minPrice}
          aria-invalid={invalid} aria-describedby={invalid ? prefix + "-range-error" : undefined} onChange={event => change("minPrice", event.target.value)} />
      </label>
      <label className="grid gap-2 text-sm text-zinc-200" htmlFor={prefix + "-maximum"}>Hasta (S/)
        <input id={prefix + "-maximum"} className={catalogField} type="number" min="0" step="0.01" placeholder="Sin límite" value={value.maxPrice}
          aria-invalid={invalid} aria-describedby={invalid ? prefix + "-range-error" : undefined} onChange={event => change("maxPrice", event.target.value)} />
      </label>
    </div>
    {invalid && <p id={prefix + "-range-error"} role="alert" className="text-sm text-rose-300">El precio mínimo no puede superar el máximo.</p>}
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-zinc-200">
      <input type="checkbox" checked={value.inStock} onChange={event => change("inStock", event.target.checked)} className="h-4 w-4 accent-[#cfac78]" />
      Mostrar solo prendas disponibles
    </label>
  </div>;
}
