"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Minus,
  Plus,
  Ruler,
  Truck,
} from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import {
  categoryName,
  fetchProducts,
  money,
  Product,
  productOptions,
  productStock,
  whatsappLink,
} from "@/lib/products";

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
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 30000);
    let active = true;
    fetchProducts<Product>(
      `/products/${encodeURIComponent(id)}`,
      controller.signal,
    )
      .then((data) => {
        if (!data?.id) throw new Error("NOT_FOUND");
        if (active) setProduct(data);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error && reason.message === "NOT_FOUND"
              ? "NOT_FOUND"
              : "CONNECTION",
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
  }, [id, attempt]);

  const button =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#cfa873]/50 px-5 text-sm font-semibold text-[#e3c193] hover:bg-[#cfa873]/10";
  function retry() {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  }
  if (loading)
    return (
      <div role="status" className="mx-auto max-w-6xl px-4 py-12">
        <p className="mb-6 text-[#e3c193]">Cargando detalles de la prenda...</p>
        <div className="grid animate-pulse gap-8 md:grid-cols-2">
          <div className="aspect-[3/4] rounded-2xl bg-white/5" />
          <div className="space-y-5 py-8">
            <div className="h-12 rounded bg-white/5" />
            <div className="h-6 w-1/3 rounded bg-white/5" />
            <div className="h-40 rounded bg-white/5" />
          </div>
        </div>
      </div>
    );
  if (error || !product)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center" role="alert">
        <h1 className="font-serif text-3xl">
          {error === "NOT_FOUND"
            ? "Prenda no encontrada"
            : "No pudimos cargar esta prenda"}
        </h1>
        <p className="my-5 text-zinc-300">
          {error === "NOT_FOUND"
            ? "La prenda puede haber sido retirada. Explora otras opciones de la colección."
            : "Revisa tu conexión y vuelve a intentarlo."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {error !== "NOT_FOUND" && (
            <button onClick={retry} className={button}>
              Volver a intentar
            </button>
          )}
          <Link href="/coleccion" className={button}>
            Ver colección
          </Link>
        </div>
      </div>
    );

  const variants = product.variants || [];
  const sizes = productOptions(product, "size");
  const colors = productOptions(product, "color");
  const requiresSize = sizes.length > 0;
  const requiresColor = colors.length > 0;
  const selected = variants.find(
    (variant) =>
      (!requiresSize || variant.size === selectedSize) &&
      (!requiresColor || variant.color === selectedColor),
  );
  const complete =
    (!requiresSize || Boolean(selectedSize)) &&
    (!requiresColor || Boolean(selectedColor));
  const stock = variants.length
    ? Number(selected?.stock || 0)
    : productStock(product);
  const requestedQuantity = Math.min(quantity, Math.max(stock, 1));
  const canBuy = complete && stock > 0 && requestedQuantity > 0;
  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const unavailableSize = (size: string) =>
    variants.length > 0 &&
    !variants.some(
      (variant) => variant.size === size && Number(variant.stock) > 0,
    );
  const unavailableColor = (color: string) =>
    variants.length > 0 &&
    !variants.some(
      (variant) =>
        variant.color === color &&
        (!selectedSize || variant.size === selectedSize) &&
        Number(variant.stock) > 0,
    );

  function chooseSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
    if (
      variants.length &&
      selectedColor &&
      !variants.some(
        (variant) =>
          variant.size === size &&
          variant.color === selectedColor &&
          Number(variant.stock) > 0,
      )
    )
      setSelectedColor("");
  }

  function buy() {
    if (!canBuy || !product) return;
    window.open(
      whatsappLink(product, {
        size: selectedSize,
        color: selectedColor,
        quantity: requestedQuantity,
        url: window.location.href.split("?")[0],
      }),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="min-h-screen bg-[#050103] px-4 py-7 text-white md:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/coleccion"
          className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-300 hover:text-[#e3c193]"
        >
          <ArrowLeft size={17} /> Volver a la colección
        </Link>
        <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
          <div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
              <ProductImage
                src={images[imageIndex]}
                alt={product.name}
                sizes="(max-width: 767px) 100vw, 50vw"
                preload
              />
            </div>
            {images.length > 1 && (
              <div
                className="mt-4 flex gap-3 overflow-x-auto pb-2"
                aria-label="Fotografías de la prenda"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    aria-label={`Ver fotografía ${index + 1} de ${product.name}`}
                    aria-pressed={imageIndex === index}
                    onClick={() => setImageIndex(index)}
                    className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${imageIndex === index ? "border-[#cfa873]" : "border-transparent opacity-70"}`}
                  >
                    <ProductImage
                      src={image}
                      alt={`${product.name}, vista ${index + 1}`}
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="py-2">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#cfa873]">
              {categoryName(product)}
            </p>
            <h1 className="font-serif text-3xl leading-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="my-5 font-serif text-3xl text-[#e3c193]">
              {money(product.price)}
            </p>
            <p className="whitespace-pre-line text-base leading-relaxed text-zinc-300">
              {product.description ||
                "Consulta los detalles de esta prenda con nuestro equipo por WhatsApp."}
            </p>
            <p
              className={`mt-5 text-sm ${productStock(product) > 0 ? "text-emerald-300" : "text-rose-300"}`}
            >
              {productStock(product) > 0 ? "Disponible" : "Prenda agotada"}
            </p>
            {requiresSize && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-sm font-semibold">
                  Elige tu talla <span className="text-[#cfa873]">*</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      disabled={unavailableSize(size)}
                      aria-pressed={selectedSize === size}
                      onClick={() => chooseSize(size)}
                      className={`min-h-12 min-w-12 rounded-xl border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-35 ${selectedSize === size ? "border-[#cfa873] bg-[#cfa873] font-semibold text-black" : "border-white/25 text-white hover:border-[#cfa873]"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {requiresColor && (
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-semibold">
                  Elige tu color <span className="text-[#cfa873]">*</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      disabled={unavailableColor(color)}
                      aria-pressed={selectedColor === color}
                      onClick={() => {
                        setSelectedColor(color);
                        setQuantity(1);
                      }}
                      className={`min-h-12 rounded-xl border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-35 ${selectedColor === color ? "border-[#cfa873] bg-[#cfa873] font-semibold text-black" : "border-white/25 text-white hover:border-[#cfa873]"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <details className="mt-6 rounded-xl border border-white/10 p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-[#e3c193]">
                <Ruler size={17} /> Ayuda para elegir tu talla
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                El calce varía según la prenda y la tela. Escríbenos con tus
                medidas de busto, cintura y cadera para confirmar la talla antes
                de comprar.
              </p>
            </details>
            <div className="mt-7 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">Cantidad</span>
              <div className="flex items-center rounded-xl border border-white/20">
                <button
                  type="button"
                  aria-label="Reducir cantidad"
                  disabled={requestedQuantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <output aria-live="polite" className="w-10 text-center">
                  {requestedQuantity}
                </output>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  disabled={!complete || requestedQuantity >= stock}
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <p
              aria-live="polite"
              className="mt-4 min-h-10 text-sm text-zinc-300"
            >
              {productStock(product) <= 0
                ? "Esta prenda está agotada por el momento."
                : !complete
                  ? "Selecciona las opciones de tu prenda para continuar."
                  : stock <= 0
                    ? "Esta combinación está agotada. Elige otra opción."
                    : variants.length
                      ? `${stock} ${stock === 1 ? "unidad disponible" : "unidades disponibles"} de esta combinación.`
                      : "Confirma la disponibilidad de talla y color con nuestro equipo."}
            </p>
            <button
              type="button"
              onClick={buy}
              disabled={!canBuy}
              className="mt-3 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-400"
            >
              <MessageCircle size={20} />
              {productStock(product) <= 0
                ? "Agotado"
                : "Consultar compra por WhatsApp"}
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-zinc-400">
              El mensaje incluirá tu selección y el subtotal de{" "}
              {money(Number(product.price) * requestedQuantity)}. Tu pedido se
              confirma con nuestro equipo.
            </p>
            <div className="mt-7 flex items-start gap-3 border-t border-white/10 pt-5 text-sm leading-relaxed text-zinc-300">
              <Truck size={20} className="mt-0.5 shrink-0 text-[#cfa873]" />
              <p>
                Consulta las opciones, costo y plazo de envío según tu destino
                antes de confirmar la compra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
