"use client";
import { confirmAction } from "@/lib/confirm-action";
import { useAdminRefresh } from "@/lib/use-admin-refresh";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch(`/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useAdminRefresh(fetchCategories);

  useEffect(() => { void Promise.resolve().then(fetchCategories); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError("");
    try {
      await apiFetch(editingId ? `/categories/${editingId}` : "/categories", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      setFormError(getErrorMessage(error));
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!await confirmAction({ title: "Eliminar categoría", description: "Esta acción quitará el registro. Si está asociado a ventas u otros datos, el sistema conservará su historial e impedirá eliminarlo." })) return;
    try {
      await apiFetch(`/categories/${id}`, {
        method: "DELETE",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
            <p className="text-muted-foreground mt-1">
              Organiza tus productos por colecciones.
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={open => {
          if (isSaving) return;
          setIsDialogOpen(open);
          setFormError("");
          if (!open) { setEditingId(null); setFormData({ name: "", description: "" }); }
        }}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="h-4 w-4" /> Añadir Categoría</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && <p role="alert" className="rounded-lg bg-rose-400/10 p-3 text-sm text-rose-200">{formError}</p>}
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                  <Input id="name" name="name" maxLength={120} value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Descripción</label>
                  <Input id="description" name="description" maxLength={2000} value={formData.description} onChange={handleInputChange} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancelar</Button>} />
                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">Guardar Categoría</Button>
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
                <TableHead>Slug</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Cargando categorías...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No hay categorías todavía. Haz clic en &quot;Añadir Categoría&quot; para empezar.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button aria-label={`Editar ${category.name}`} variant="ghost" size="icon" className="h-11 w-11 text-zinc-300 hover:bg-white/10" onClick={() => { setEditingId(category.id); setFormData({ name: category.name, description: category.description || "" }); setIsDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button aria-label={`Eliminar ${category.name}`} variant="ghost" size="icon" className="h-11 w-11 text-rose-300 hover:bg-rose-400/10" onClick={() => handleDelete(category.id)}>
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
