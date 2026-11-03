"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { apiJson, getErrorMessage } from "@/lib/api";

type Variant = { id: string; size: string | null; color: string | null; stock: number };
type SaleProduct = { id: string; name: string; price: string | number; stock: number; variants?: Variant[] };
const emptyForm = { customerName: "", customerPhone: "", productId: "", variantId: "", quantity: "1" };

export function ManualSaleDialog({ onSaved }: { onSaved: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const request = useRef<{ signature: string; id: string } | null>(null);
  const product = products.find(product => product.id === form.productId);
  const variant = product?.variants?.find(variant => variant.id === form.variantId);
  const available = Number(product?.variants?.length ? variant?.stock || 0 : product?.stock || 0);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try { setProducts(await apiJson<SaleProduct[]>("/products")); }
    catch (error) { setError(getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    const quantity = Number(form.quantity);
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > available) {
      setError("Selecciona un producto y una cantidad disponible."); return;
    }
    if (product.variants?.length && !variant) { setError("Selecciona la talla y el color vendidos."); return; }
    const payload = { customerName: form.customerName.trim(), customerPhone: form.customerPhone.trim(), items: [{ productId: product.id, quantity, ...(variant ? { variantId: variant.id } : {}) }] };
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) request.current = { signature, id: crypto.randomUUID() };
    setBusy(true);
    try {
      await apiJson("/orders/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, requestId: request.current.id }) });
      setForm(emptyForm);
      request.current = null;
      setOpen(false);
      setSuccess("Venta registrada. El inventario se actualizó correctamente.");
      await onSaved();
    } catch (error) { setError(getErrorMessage(error)); }
    finally { setBusy(false); }
  };

  return <div className="space-y-2">
    {success && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-300">{success}</p>}
    <Dialog open={open} onOpenChange={value => { if (busy) return; setOpen(value); if (value) { setSuccess(""); void loadProducts(); } }}>
      <DialogTrigger render={<Button className="gap-2 bg-green-600 hover:bg-green-700 text-white"><Plus className="h-4 w-4" />Registrar venta WhatsApp</Button>} />
      <DialogContent className="sm:max-w-[460px] max-h-[90dvh] overflow-y-auto">
        <form onSubmit={save}>
          <DialogHeader><DialogTitle>Registrar venta pagada</DialogTitle></DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">Registra esta venta cuando hayas confirmado el pago del cliente.</p>
          <div className="grid gap-4 py-4">
            {error && <div role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</div>}
            <label className="grid gap-2 text-sm">Nombre del cliente<Input required maxLength={150} autoComplete="name" value={form.customerName} onChange={event => setForm({ ...form, customerName: event.target.value })} /></label>
            <label className="grid gap-2 text-sm">Teléfono (WhatsApp)<Input required type="tel" maxLength={30} autoComplete="tel" value={form.customerPhone} onChange={event => setForm({ ...form, customerPhone: event.target.value })} /></label>
            <label className="grid gap-2 text-sm">Producto
              <select required disabled={loading || busy} value={form.productId} onChange={event => setForm({ ...form, productId: event.target.value, variantId: "", quantity: "1" })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground">
                <option value="">{loading ? "Cargando productos..." : "Seleccionar producto"}</option>
                {products.map(product => <option key={product.id} value={product.id} disabled={Number(product.stock) <= 0}>{product.name} — S/ {Number(product.price).toFixed(2)} — {product.stock} disponibles</option>)}
              </select>
            </label>
            {!!product?.variants?.length && <label className="grid gap-2 text-sm">Talla y color
              <select required disabled={busy} value={form.variantId} onChange={event => setForm({ ...form, variantId: event.target.value, quantity: "1" })} className="h-11 rounded-lg border border-input bg-background px-3 text-foreground">
                <option value="">Seleccionar combinación</option>
                {product.variants.map(variant => <option key={variant.id} value={variant.id} disabled={Number(variant.stock) <= 0}>{[variant.size, variant.color].filter(Boolean).join(" / ") || "Única"} — {variant.stock} disponibles</option>)}
              </select>
            </label>}
            <label className="grid gap-2 text-sm">Cantidad<Input required type="number" min={1} step={1} max={available || 1} disabled={busy || !available} value={form.quantity} onChange={event => setForm({ ...form, quantity: event.target.value })} /></label>
            {product && <p className="text-sm text-muted-foreground">Total: S/ {(Number(product.price) * Number(form.quantity || 0)).toFixed(2)} · {available} disponibles</p>}
            {!loading && !products.length && <Button type="button" variant="outline" onClick={() => void loadProducts()}>Reintentar carga de productos</Button>}
          </div>
          <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cerrar</Button><Button type="submit" disabled={busy || loading || !available}>{busy ? "Guardando..." : "Registrar venta pagada"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
