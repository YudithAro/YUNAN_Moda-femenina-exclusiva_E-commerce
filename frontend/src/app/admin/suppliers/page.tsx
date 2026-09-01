"use client";

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
import { ArrowLeft, Plus, Trash2, Building2, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  active: boolean;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/suppliers`);
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          active: true
        }),
      });
      setIsDialogOpen(false);
      setFormData({ name: "", contactName: "", email: "", phone: "" });
      fetchSuppliers();
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/suppliers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      fetchSuppliers();
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este proveedor?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/suppliers/${id}`, {
        method: "DELETE",
      });
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
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
            <h2 className="text-3xl font-bold tracking-tight">Proveedores</h2>
            <p className="text-muted-foreground mt-1">
              Gestiona a tus socios comerciales, fabricantes y mayoristas.
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white"><Plus className="h-4 w-4" /> Añadir Proveedor</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Empresa / Marca</label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="name" name="name" className="pl-9" placeholder="EJ: Distribuidora Textil SAC" value={formData.name} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contactName" className="text-sm font-medium">Nombre de Contacto</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="contactName" name="contactName" className="pl-9" placeholder="EJ: Juan Pérez" value={formData.contactName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" name="phone" className="pl-9" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" type="email" className="pl-9" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancelar</Button>} />
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">Guardar Proveedor</Button>
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
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto Directo</TableHead>
                <TableHead>Datos de Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Cargando proveedores...</TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No has registrado proveedores. Añade uno nuevo.
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-500/10">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span className="font-bold">{supplier.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {supplier.contactName || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground gap-1">
                        {supplier.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}
                        {!supplier.phone && !supplier.email && <span>-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`h-7 px-3 text-xs rounded-full ${supplier.active ? 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-500/10' : 'text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-500/10'}`}
                        onClick={() => toggleStatus(supplier.id, supplier.active)}
                      >
                        {supplier.active ? 'Activo' : 'Inactivo'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
