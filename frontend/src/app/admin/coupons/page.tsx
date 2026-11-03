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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Ticket, Percent, DollarSign } from "lucide-react";
import Link from "next/link";

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
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCoupons = async () => {
    try {
      const res = await apiFetch(`/coupons`);
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useAdminRefresh(fetchCoupons);

  useEffect(() => { void Promise.resolve().then(fetchCoupons); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, '') }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError("");
    try {
      await apiFetch(`/coupons`, {
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
      setFormError(getErrorMessage(error));
    } finally { setIsSaving(false); }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/coupons/${id}`, {
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
    if (!await confirmAction({ title: "Eliminar cupón", description: "Esta acción quitará el registro. Si está asociado a ventas u otros datos, el sistema conservará su historial e impedirá eliminarlo." })) return;
    try {
      await apiFetch(`/coupons/${id}`, {
        method: "DELETE",
      });
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
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
            <h2 className="text-3xl font-bold tracking-tight">Cupones</h2>
            <p className="text-muted-foreground mt-1">
              Crea códigos de descuento para promociones y campañas.
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={open => { if (!isSaving) { setIsDialogOpen(open); setFormError(""); } }}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="h-4 w-4" /> Crear Cupón</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nuevo Cupón</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && <p role="alert" className="rounded-lg bg-rose-400/10 p-3 text-sm text-rose-200">{formError}</p>}
                <div className="grid gap-2">
                  <label htmlFor="code" className="text-sm font-medium">Código del Cupón</label>
                  <div className="relative">
                    <Ticket className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      name="code" maxLength={64} pattern="[A-Za-z0-9_-]+"
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
                    <label htmlFor="coupon-type" className="text-sm font-medium">Tipo de Descuento</label>
                    <Select items={{ PERCENTAGE: "Porcentaje (%)", FIXED: "Monto Fijo (S/)" }} value={formData.type} onValueChange={(val) => { if (val) handleTypeChange(val); }}>
                      <SelectTrigger id="coupon-type">
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
                        min="0.01"
                        max={formData.type === "PERCENTAGE" ? "100" : "99999999.99"}
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
                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">Generar Cupón</Button>
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
                    <TableCell className="font-medium text-pink-600 dark:text-zinc-300">
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
                      <Button aria-label={`Eliminar cupón ${coupon.code}`} variant="ghost" size="icon" className="h-11 w-11 text-rose-300 hover:bg-rose-400/10" onClick={() => handleDelete(coupon.id)}>
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
