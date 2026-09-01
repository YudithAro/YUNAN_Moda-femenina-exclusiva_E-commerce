"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingBag, Truck, ArrowLeft, Plus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardStats() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    productId: "",
    quantity: "1"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/dashboard/metrics`);
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return alert("Selecciona un producto");
    
    setIsSubmitting(true);
    try {
      const product = products.find(p => p.id === formData.productId);
      if (!product) return;

      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: [
          {
            productId: product.id,
            quantity: parseInt(formData.quantity, 10),
            price: parseFloat(product.price)
          }
        ]
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      setIsModalOpen(false);
      setFormData({ customerName: "", customerPhone: "", productId: "", quantity: "1" });
      fetchMetrics();
      fetchProducts();
    } catch (error) {
      console.error("Error registering sale:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !metrics) {
    return <div className="p-8 text-center text-pink-500">Cargando estadísticas...</div>;
  }

  const chartData = metrics.monthlyRevenue?.length > 0 ? metrics.monthlyRevenue : [
    { name: "Mes", total: 0 }
  ];

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
            <h2 className="text-3xl font-bold tracking-tight">Estadísticas y Reportes</h2>
            <p className="text-muted-foreground mt-1">
              Rendimiento de ventas y métricas clave de la tienda.
            </p>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-green-600 hover:bg-green-700 text-white"><Plus className="h-4 w-4" /> Registrar Venta WhatsApp</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleRegisterSale}>
              <DialogHeader>
                <DialogTitle>Registrar Venta Manual</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nombre del Cliente</label>
                  <Input name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Teléfono (WhatsApp)</label>
                  <Input name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Producto Vendido</label>
                  <Select value={formData.productId} onValueChange={(val) => setFormData(p => ({...p, productId: val}))}>
                    <SelectTrigger className="bg-transparent text-white border-white/20">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0508] border-white/10 text-white">
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id} className="hover:bg-pink-900/30">{p.name} (S/ {p.price}) - Stock: {p.stock}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleInputChange} required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancelar</Button>} />
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                  {isSubmitting ? "Guardando..." : "Guardar Venta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {metrics.totalRevenue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Registrados</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos Bajo Stock</CardTitle>
            <Truck className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.lowStockItems || 0}</div>
            <p className="text-xs text-muted-foreground">Artículos con 10 o menos en stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-pink-500)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-pink-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--color-pink-500)" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto">
            <div className="space-y-8 mt-4">
              {metrics.recentOrders?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No hay ventas registradas aún.</p>
              ) : (
                metrics.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {order.customer_name ? order.customer_name.substring(0, 2).toUpperCase() : 'W'}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[150px]">{order.customer_name || 'Cliente WhatsApp'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.customer_email || 'Sin email'}</p>
                    </div>
                    <div className="ml-auto font-medium text-green-500">+S/ {Number(order.total).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
