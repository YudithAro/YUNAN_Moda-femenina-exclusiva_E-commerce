"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getImageUrl } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  category: { name: string } | null;
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
  const [categories, setCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products`);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId || (product.category ? product.category.id : ""),
      sizes: product.sizes ? product.sizes.join(", ") : "",
      colors: product.colors ? product.colors.join(", ") : ""
    });
    setEditingId(product.id);
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrls: string[] = [];

      // 1. Upload images if selected
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadData = new FormData();
          uploadData.append("image", file);
          
          const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products/upload`, {
            method: "POST",
            body: uploadData,
          });
          const uploadResult = await uploadRes.json();
          if (uploadResult.url) {
            imageUrls.push(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${uploadResult.url}`);
          }
        }
      }

      if (editingId) {
        const payload: any = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          categoryId: formData.categoryId || undefined,
          sizes: formData.sizes.split(",").map(s => s.trim()).filter(Boolean),
          colors: formData.colors.split(",").map(c => c.trim()).filter(Boolean),
        };
        if (imageUrls.length > 0) {
          payload.images = imageUrls;
        }
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // 2. Create product
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            categoryId: formData.categoryId || undefined,
            sizes: formData.sizes.split(",").map(s => s.trim()).filter(Boolean),
            colors: formData.colors.split(",").map(c => c.trim()).filter(Boolean),
            images: imageUrls,
          }),
        });
      }
      
      setIsUploading(false);
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", stock: "", categoryId: "", sizes: "", colors: "" });
      setImageFiles([]);
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products/${id}`, {
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
          setIsDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({ name: "", description: "", price: "", stock: "", categoryId: "", sizes: "", colors: "" });
          }
        }}>
          <DialogTrigger render={<Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white"><Plus className="h-4 w-4" /> Añadir Producto</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Select value={formData.categoryId} onValueChange={(value) => { if (value) setFormData(prev => ({ ...prev, categoryId: value }))}}>
                    <SelectTrigger className="bg-transparent text-white border-white/20">
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
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="stock" className="text-sm font-medium">Stock</label>
                    <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
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
                <div className="grid gap-2">
                  <label htmlFor="image" className="text-sm font-medium">Imágenes del Producto</label>
                  <Input id="image" type="file" accept="image/*" multiple onChange={handleFileChange} className="cursor-pointer" />
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
                    No hay productos todavía. Haz clic en "Añadir Producto" para empezar.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 border">
                          <img src={getImageUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
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
