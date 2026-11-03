"use client";
import { apiFetch, getErrorMessage } from "@/lib/api";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface Variant { id?: string; size: string | null; color: string | null; stock: number; }
interface Category { id: string; name: string; }

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  description?: string;
  categoryId?: string;
  sizes?: string[];
  colors?: string[];
  variants?: Variant[];
  category: { id?: string; name: string } | null;
  images?: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    sizes: "",
    colors: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await apiFetch(`/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiFetch(`/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchProducts);
    void Promise.resolve().then(fetchCategories);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId || product.category?.id || "",
      sizes: product.sizes ? product.sizes.join(", ") : "",
      colors: product.colors ? product.colors.join(", ") : ""
    });
    setVariants((product.variants || []).map(variant => ({ ...variant })));
    setError("");
    setEditingId(product.id);
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setError("");
    try {
      if (!formData.categoryId) throw new Error("Selecciona una categoría.");
      if (variants.some(variant => (!variant.size?.trim() && !variant.color?.trim()) || !Number.isSafeInteger(Number(variant.stock)) || Number(variant.stock) < 0)) throw new Error("Cada combinación necesita una talla o color y stock entero desde cero.");
      const combinations = variants.map(variant => `${variant.size?.trim().toLowerCase() || ""}|${variant.color?.trim().toLowerCase() || ""}`);
      if (new Set(combinations).size !== combinations.length) throw new Error("Hay combinaciones de talla y color repetidas.");
      setIsUploading(true);
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Elige imágenes JPG, PNG o WebP de hasta 5 MB cada una.");
        const uploadData = new FormData();
        uploadData.append("image", file);
        const uploadRes = await apiFetch("/products/upload", { method: "POST", body: uploadData });
        const uploadResult = await uploadRes.json();
        if (!uploadResult.url) throw new Error("No se pudo guardar una de las imágenes. Inténtalo de nuevo.");
        imageUrls.push(uploadResult.url);
      }
      const payload = {
        name: formData.name.trim(), description: formData.description.trim(),
        price: Number(formData.price), stock: variants.length ? variants.reduce((sum, variant) => sum + Number(variant.stock), 0) : Number(formData.stock),
        categoryId: formData.categoryId,
        sizes: formData.sizes.split(",").map(size => size.trim()).filter(Boolean),
        colors: formData.colors.split(",").map(color => color.trim()).filter(Boolean),
        ...(variants.length ? { variants: variants.map(variant => ({ ...variant, size: variant.size?.trim() || null, color: variant.color?.trim() || null, stock: Number(variant.stock) })) } : {}),
        ...((imageUrls.length || !editingId) ? { images: imageUrls } : {}),
      };
      await apiFetch(editingId ? `/products/${editingId}` : "/products", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setSuccess(editingId ? "Producto actualizado." : "Producto creado.");
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", stock: "", categoryId: "", sizes: "", colors: "" });
      setVariants([]);
      setImageFiles([]);
      await fetchProducts();
    } catch (error) { setError(getErrorMessage(error)); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      const res = await apiFetch(`/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("No se pudo eliminar el producto. Verifica que el servidor esté activo o que no tenga restricciones.");
    }
  };

  return (
    <div className="space-y-8">
      {success && <p role="status" className="text-emerald-600 dark:text-emerald-300">{success}</p>}
      {error && !isDialogOpen && <p role="alert" className="text-red-600 dark:text-red-300">{error}</p>}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
            <p className="text-muted-foreground mt-1">
              Gestiona tu inventario y catálogo.
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (isUploading) return;
          setIsDialogOpen(open);
          if (open && !editingId) { setVariants([]); setImageFiles([]); setError(""); setSuccess(""); }
          if (!open) {
            setEditingId(null);
            setFormData({ name: "", description: "", price: "", stock: "", categoryId: "", sizes: "", colors: "" });
          }
        }}>
          <DialogTrigger render={<Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white"><Plus className="h-4 w-4" /> Añadir Producto</Button>} />
          <DialogContent className="sm:max-w-[620px] max-h-[90dvh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Descripción</label>
                  <Input id="description" name="description" value={formData.description} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">Categoría</label>
                  <Select items={categories.map(category => ({ value: category.id, label: category.name }))} value={formData.categoryId} onValueChange={(value) => { if (value) setFormData(prev => ({ ...prev, categoryId: value }))}}>
                    <SelectTrigger id="category" className="bg-background text-foreground border-input">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0508] border-white/10 text-white">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="hover:bg-pink-900/30">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="price" className="text-sm font-medium">Precio (S/)</label>
                    <Input id="price" name="price" type="number" min="0.01" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="stock" className="text-sm font-medium">Stock</label>
                    <Input id="stock" name="stock" type="number" min="0" step="1" disabled={variants.length > 0} value={variants.length ? variants.reduce((sum, variant) => sum + Number(variant.stock), 0) : formData.stock} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="sizes" className="text-sm font-medium">Tallas</label>
                    <Input id="sizes" name="sizes" placeholder="Ej: S, M, L" value={formData.sizes} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="colors" className="text-sm font-medium">Colores</label>
                    <Input id="colors" name="colors" placeholder="Ej: Rojo, Azul" value={formData.colors} onChange={handleInputChange} />
                  </div>
                </div>
                <fieldset className="space-y-3 rounded-xl border p-3">
                  <legend className="px-1 text-sm font-medium">Inventario por talla y color</legend>
                  <p className="text-xs text-muted-foreground">Registra las unidades reales de cada combinación. El stock total será la suma de estas filas. Para cambiar una talla o color ya guardados, agota esa fila y añade una nueva.</p>
                  {variants.map((variant, index) => <div key={variant.id || `new-${index}`} className="grid grid-cols-[1fr_1fr_80px_auto] items-end gap-2">
                    <label className="grid gap-1 text-xs">Talla<Input readOnly={!!variant.id} aria-label={`Talla de combinación ${index + 1}`} value={variant.size || ""} maxLength={50} onChange={event => setVariants(rows => rows.map((row, i) => i === index ? { ...row, size: event.target.value } : row))} /></label>
                    <label className="grid gap-1 text-xs">Color<Input readOnly={!!variant.id} aria-label={`Color de combinación ${index + 1}`} value={variant.color || ""} maxLength={50} onChange={event => setVariants(rows => rows.map((row, i) => i === index ? { ...row, color: event.target.value } : row))} /></label>
                    <label className="grid gap-1 text-xs">Unidades<Input aria-label={`Stock de combinación ${index + 1}`} type="number" required min="0" step="1" value={variant.stock} onChange={event => setVariants(rows => rows.map((row, i) => i === index ? { ...row, stock: Number(event.target.value) } : row))} /></label>
                    <Button type="button" variant="outline" aria-label={variant.id ? "Marcar combinación agotada" : "Quitar combinación"} onClick={() => setVariants(rows => variant.id ? rows.map((row, i) => i === index ? { ...row, stock: 0 } : row) : rows.filter((_, i) => i !== index))}>{variant.id ? "Agotar" : "Quitar"}</Button>
                  </div>)}
                  <Button type="button" variant="outline" onClick={() => setVariants(rows => [...rows, { size: "", color: "", stock: 0 }])}>Añadir combinación</Button>
                </fieldset>
                <div className="grid gap-2">
                  <label htmlFor="image" className="text-sm font-medium">Imágenes del Producto (Galería o Cámara)</label>
                  <Input id="image" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} className="cursor-pointer" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancelar</Button>} />
                <Button type="submit" disabled={isUploading} className="bg-pink-600 hover:bg-pink-700 text-white">
                  {isUploading ? "Guardando..." : "Guardar Producto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Cargando productos...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No hay productos todavía. Haz clic en &quot;Añadir Producto&quot; para empezar.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 border">
                          <Image unoptimized width={40} height={40} src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 border">
                          <span className="text-xs text-muted-foreground">Img</span>
                        </div>
                      )}
                      <span>{product.name}</span>
                    </TableCell>
                    <TableCell>{product.category?.name || "General"}</TableCell>
                    <TableCell className="text-right">S/ {Number(product.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
