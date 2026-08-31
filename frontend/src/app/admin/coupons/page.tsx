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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Ticket, Percent, DollarSign } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  discount: string;
  type: "PERCENTAGE" | "FIXED";
  active: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    type: "PERCENTAGE",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("http://localhost:3000/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, '') }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3000/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code,
          discount: parseFloat(formData.discount),
          type: formData.type,
          active: true
        }),
      });
      setIsDialogOpen(false);
      setFormData({ code: "", discount: "", type: "PERCENTAGE" });
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:3000/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este cupón?")) return;
    try {
      await fetch(`http://localhost:3000/coupons/${id}`, {
        method: "DELETE",
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
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
            <h2 className="text-3xl font-bold tracking-tight">Cupones</h2>
            <p className="text-muted-foreground mt-1">
              Crea códigos de descuento para promociones y campañas.
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white"><Plus className="h-4 w-4" /> Crear Cupón</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nuevo Cupón</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="code" className="text-sm font-medium">Código del Cupón</label>
                  <div className="relative">
                    <Ticket className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="code" 
                      name="code" 
                      placeholder="EJ: VERANO2026" 
                      className="pl-9 font-mono" 
                      value={formData.code} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Tipo de Descuento</label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                        <SelectItem value="FIXED">Monto Fijo (S/)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="discount" className="text-sm font-medium">Valor</label>
                    <div className="relative">
                      {formData.type === "PERCENTAGE" ? (
                        <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input 
                        id="discount" 
                        name="discount" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        max={formData.type === "PERCENTAGE" ? "100" : undefined}
                        className="pl-9" 
                        value={formData.discount} 
                        onChange={(e) => setFormData(p => ({ ...p, discount: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancelar</Button>} />
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">Generar Cupón</Button>
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
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Cargando cupones...</TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No hay cupones activos. Crea uno para empezar tus promociones.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-muted">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-mono font-bold tracking-wider">{coupon.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-pink-600 dark:text-pink-400">
                      {coupon.type === "PERCENTAGE" ? (
                        `-${Number(coupon.discount)}%`
                      ) : (
                        `-S/ ${Number(coupon.discount).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(coupon.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`h-7 px-3 text-xs rounded-full ${coupon.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-500/10'}`}
                        onClick={() => toggleStatus(coupon.id, coupon.active)}
                      >
                        {coupon.active ? 'Activo' : 'Inactivo'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(coupon.id)}>
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
