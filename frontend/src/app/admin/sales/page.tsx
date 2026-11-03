"use client";
import { useAdminRefresh } from "@/lib/use-admin-refresh";
import { apiFetch, getErrorMessage } from "@/lib/api";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  total: string | number;
  status: string;
  createdAt: string;
  itemCount: number;
  customerName?: string;
  customerPhone?: string;
  items?: { id: string; quantity: number; price: string | number; size?: string; color?: string; product?: { name: string }; variant?: { size?: string; color?: string } }[];
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const statusLabels: Record<string, string> = { PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };
const transitions: Record<string, string[]> = { PENDING: ["PAID", "CANCELLED"], PAID: ["SHIPPED", "CANCELLED"], SHIPPED: ["DELIVERED"], DELIVERED: [], CANCELLED: [] };

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailError, setDetailError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await apiFetch(`/orders`);
      const data = await res.json();
      setOrders(data);
      setLoadError("");
    } catch (error) {
      setLoadError(getErrorMessage(error));
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useAdminRefresh(fetchOrders);

  useEffect(() => { void Promise.resolve().then(fetchOrders); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (updatingId) return;
    setUpdatingId(id);
    setNotice("");
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setNotice(newStatus === "CANCELLED" ? "Pedido cancelado." : "Estado actualizado.");
      await fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally { setUpdatingId(null); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-500/10">Pendiente</Badge>;
      case "PAID":
        return <Badge variant="outline" className="text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-500/10">Pagado</Badge>;
      case "SHIPPED":
        return <Badge variant="outline" className="text-indigo-500 border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10">Enviado</Badge>;
      case "DELIVERED":
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10">Completado</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="text-red-500 border-red-500 bg-red-50 dark:bg-red-500/10">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {notice && <p role="status" className="text-emerald-600 dark:text-emerald-300">{notice}</p>}
      <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Detalle del pedido</DialogTitle></DialogHeader>
          {detail && <div className="space-y-4 text-sm"><p>#{detail.id.slice(0, 8).toUpperCase()} · {statusLabels[detail.status] || detail.status}</p><p>{detail.customerName || detail.user?.name || "Cliente invitado"}<br />{detail.customerPhone || detail.user?.email}</p>
            {detailError && <p role="alert" className="text-red-600 dark:text-red-300">{detailError}</p>}
            {!detail.items && !detailError && <p>Cargando productos...</p>}
            {detail.items?.map(item => <div key={item.id} className="flex justify-between gap-4 border-b pb-2"><div>{item.product?.name || "Producto"}<p className="text-muted-foreground">{[item.size || item.variant?.size, item.color || item.variant?.color].filter(Boolean).join(" / ")}</p><p>{item.quantity} × S/ {Number(item.price).toFixed(2)}</p></div><strong>S/ {(item.quantity * Number(item.price)).toFixed(2)}</strong></div>)}
            <p className="font-bold">Total: S/ {Number(detail.total).toFixed(2)}</p>
          </div>}
        </DialogContent>
      </Dialog>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
            <p className="text-muted-foreground mt-1">
              Gestiona el historial de pedidos y su estado.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">ID Pedido</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Cargando ventas...</TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center"><p role="alert" className="mb-3">{loadError}</p><Button variant="outline" onClick={() => void fetchOrders()}>Reintentar</Button></TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No hay pedidos todavía.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                      {order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName || order.user?.name || "Cliente invitado"}</span>
                        <span className="text-xs text-muted-foreground">{order.customerPhone || order.user?.email || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      S/ {Number(order.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <Select
                          items={statusLabels}
                          disabled={!!updatingId || !(transitions[order.status]?.length)}
                          value={order.status}
                          onValueChange={(val) => {
                            if (val) handleStatusChange(order.id, val);
                          }}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue placeholder="Cambiar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={order.status}>{statusLabels[order.status] || order.status}</SelectItem>
                            {(transitions[order.status] || []).map(status => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label="Ver detalle del pedido" className="h-8 w-8 text-pink-600 hover:text-pink-700 hover:bg-pink-50" onClick={async () => {
                        setDetail(order); setDetailError("");
                        try { const response = await apiFetch(`/orders/${order.id}`); const data: Order = await response.json(); setDetail(current => current?.id === order.id ? data : current); }
                        catch (error) { setDetailError(getErrorMessage(error)); }
                      }}>
                        <Eye className="h-4 w-4" />
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
