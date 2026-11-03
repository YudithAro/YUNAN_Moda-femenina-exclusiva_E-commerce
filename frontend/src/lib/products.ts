export interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category?: { id?: string; name: string } | string | null;
  images?: string[];
  image?: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  createdAt?: string;
}

export const money = (value: number | string) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    Number(value),
  );

export const categoryName = (product: Product) =>
  typeof product.category === "string"
    ? product.category
    : product.category?.name || "General";

export function productOptions(product: Product, key: "size" | "color") {
  if (product.variants?.length) {
    return [
      ...new Set(
        product.variants
          .map((variant) => variant[key])
          .filter((value): value is string => Boolean(value)),
      ),
    ];
  }
  return (key === "size" ? product.sizes : product.colors) || [];
}

export const productStock = (product: Product) =>
  product.variants?.length
    ? product.variants.reduce((sum, variant) => sum + Number(variant.stock), 0)
    : Number(product.stock);

export async function fetchProducts<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const response = await fetch(`${base}${path}`, { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "NOT_FOUND"
        : "No pudimos cargar la colección. Inténtalo nuevamente.",
    );
  }
  return response.json() as Promise<T>;
}

export function whatsappLink(
  product: Product,
  options: { size: string; color: string; quantity: number; url: string },
) {
  const phone = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51951162161"
  ).replace(/\D/g, "");
  const text = [
    `Hola, me interesa ${product.name}.`,
    `Precio por unidad: ${money(product.price)}`,
    options.size && `Talla: ${options.size}`,
    options.color && `Color: ${options.color}`,
    `Cantidad: ${options.quantity}`,
    `Subtotal: ${money(Number(product.price) * options.quantity)}`,
    options.url,
    "¿Me confirmas la disponibilidad y el costo de envío?",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
