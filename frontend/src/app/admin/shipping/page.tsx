"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  total: string | number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function ShippingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filtrar pedidos por estado para el tablero Kanban
  const preparing = orders.filter(o => o.status === "PENDING" || o.status === "PAID");
  const shipping = orders.filter(o => o.status === "SHIPPED");
  const delivered = orders.filter(o => o.status === "COMPLETED");

  const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon, color }: { order: Order, nextStatus?: string, nextLabel?: string, icon: any, color: string }) => (
    <Card className="mb-4 bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
            #{order.id.slice(0, 8).toUpperCase()}
          </div>
          <Badge variant="outline" className={`${color} bg-background`}>
            {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </Badge>
        </div>
        
        <h4 className="font-medium text-sm mb-1">{order.user?.name || "Cliente Invitado"}</h4>
        
        <div className="flex items-center text-xs text-muted-foreground mb-4">
          <MapPin className="h-3 w-3 mr-1" />
          <span>Dirección pendiente de registro</span>
        </div>
        
        <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
          <span className="font-bold text-sm">S/ {Number(order.total).toFixed(2)}</span>
          {nextStatus && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 text-xs flex items-center gap-1 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
              onClick={() => handleUpdateStatus(order.id, nextStatus)}
            >
              <Icon className="h-3 w-3" />
              {nextLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
            <h2 className="text-3xl font-bold tracking-tight">Logística y Envíos</h2>
            <p className="text-muted-foreground mt-1">
              Controla el flujo de despacho de tus productos.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Cargando tablero logístico...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Columna 1: Por Preparar */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-500/20">
                  <Package className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base">Por Preparar</h3>
              </div>
              <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">{preparing.length}</Badge>
            </div>
            
            <div className="space-y-4">
              {preparing.length === 0 && <p className="text-xs text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-lg">No hay pedidos pendientes.</p>}
              {preparing.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  nextStatus="SHIPPED" 
                  nextLabel="Despachar" 
                  icon={Truck}
                  color="text-amber-600 border-amber-200"
                />
              ))}
            </div>
          </div>

          {/* Columna 2: En Tránsito */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-500/20">
                  <Truck className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base">En Tránsito</h3>
              </div>
              <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100">{shipping.length}</Badge>
            </div>
            
            <div className="space-y-4">
              {shipping.length === 0 && <p className="text-xs text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-lg">No hay envíos en curso.</p>}
              {shipping.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  nextStatus="COMPLETED" 
                  nextLabel="Entregado" 
                  icon={CheckCircle2}
                  color="text-blue-600 border-blue-200"
                />
              ))}
            </div>
          </div>

          {/* Columna 3: Entregados */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base">Entregados</h3>
              </div>
              <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{delivered.length}</Badge>
            </div>
            
            <div className="space-y-4">
              {delivered.length === 0 && <p className="text-xs text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-lg">No hay entregas recientes.</p>}
              {delivered.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  icon={CheckCircle2}
                  color="text-emerald-600 border-emerald-200"
                />
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
