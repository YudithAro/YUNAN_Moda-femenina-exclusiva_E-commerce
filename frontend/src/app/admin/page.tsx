"use client";
import { apiFetch } from "@/lib/api";
import { ManualSaleDialog } from "@/components/admin/ManualSaleDialog";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Package, Tags, Users, FileText, ShoppingBag, Truck, Ticket, Building2,
  Settings, TrendingUp, AlertTriangle, DollarSign, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  lowStockItems: number;
  monthlyRevenue: { name: string; total: number }[];
  ordersByStatus?: { name: string; value: number }[];
  topProducts?: { name: string; sold: number }[];
  recentOrders: {
    id: string;
    total: string;
    status: string;
    createdAt: string;
    customer_name: string;
    customer_email: string;
  }[];
}

const COLORS = ['#db2777', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchMetrics = async () => {
    try {
      const res = await apiFetch(`/dashboard/metrics`);
      if (!res.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const data = await res.json();
      // Rellenar datos si no hay suficientes meses
      let chartData = data.monthlyRevenue || [];
      if (chartData.length === 0) {
        chartData = [
          { name: "Ene", total: 0 },
          { name: "Feb", total: 0 },
          { name: "Mar", total: 0 },
          { name: "Abr", total: 0 },
          { name: "May", total: 0 },
          { name: "Jun", total: 0 }
        ];
      }

      const statusMap: Record<string, string> = {
        PENDING: "PENDIENTE",
        PAID: "PAGADO",
        SHIPPED: "ENVIADO",
        DELIVERED: "ENTREGADO",
        CANCELLED: "CANCELADO"
      };

      // Asegurar que existan datos por estado y top productos (sin mockear datos irreales)
      const ordersByStatus = data.ordersByStatus && data.ordersByStatus.length > 0
        ? data.ordersByStatus.map((s: { name: string; value: number }) => ({ ...s, name: statusMap[s.name] || s.name }))
        : [];

      const topProducts = data.topProducts && data.topProducts.length > 0
        ? data.topProducts
        : [];

      setMetrics({ ...data, monthlyRevenue: chartData, ordersByStatus, topProducts });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void Promise.resolve().then(fetchMetrics); }, []);


  const modules = [
    { name: "Productos", icon: Package, href: "/admin/products", color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
    { name: "Categorías", icon: Tags, href: "/admin/categories", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: "Ventas", icon: FileText, href: "/admin/sales", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { name: "Envíos", icon: Truck, href: "/admin/shipping", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { name: "Clientes", icon: Users, href: "/admin/customers", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { name: "Cupones", icon: Ticket, href: "/admin/coupons", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { name: "Proveedores", icon: Building2, href: "/admin/suppliers", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
    { name: "Alertas", icon: AlertTriangle, href: "/admin/alerts", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    { name: "Admin", icon: Settings, href: "/admin/settings", color: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Accesos Rápidos (Grid de Módulos Mejorado) */}
      <div className="bg-card shadow-lg border border-border rounded-2xl p-4 sm:p-6 mb-8 mt-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" /> Módulos de Administración
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-4">
          {modules.map((module, i) => {
            const Icon = module.icon;
            const darkBgClass = module.color.split(' ')[2]; // dark:bg-pink-900/30
            const darkTextClass = module.color.split(' ')[3]; // dark:text-pink-400

            return (
              <motion.div key={module.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={module.href}>
                  <div className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border/50 hover:border-current transition-all cursor-pointer ${darkBgClass} ${darkTextClass} hover:shadow-lg hover:-translate-y-1 h-full bg-card/50`}>
                    <Icon className="h-6 w-6" />
                    <span className="font-semibold text-xs text-center">{module.name}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Dashboard General</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Análisis de rendimiento, ventas y métricas clave en tiempo real.
          </p>
        </div>

        <ManualSaleDialog onSaved={fetchMetrics} />
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
           <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
           <p className="font-bold tracking-widest uppercase text-sm">Cargando métricas...</p>
        </div>
      ) : metrics ? (
        <>
          {/* Tarjetas de Resumen (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card shadow-lg border-border hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <DollarSign className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ingresos Totales</span>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-500/20 dark:text-emerald-400 shadow-inner">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-col mt-2 z-10">
                  <span className="text-4xl font-extrabold text-foreground">S/ {Number(metrics.totalRevenue || 0).toFixed(2)}</span>
                  <span className="text-sm text-emerald-600 flex items-center gap-1 mt-2 font-semibold">
                    <TrendingUp className="h-4 w-4" /> Ventas confirmadas
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg border-border hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <ShoppingBag className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pedidos Totales</span>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-500/20 dark:text-blue-400 shadow-inner">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-col mt-2 z-10">
                  <span className="text-4xl font-extrabold text-foreground">{metrics.totalOrders}</span>
                  <span className="text-sm text-muted-foreground mt-2 font-semibold">
                    Todos los estados
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-lg border-border hover:border-pink-500/50 transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Users className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Clientes registrados</span>
                  <div className="p-3 bg-pink-100 text-pink-600 rounded-xl dark:bg-pink-500/20 dark:text-pink-400 shadow-inner">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-col mt-2 z-10">
                  <span className="text-4xl font-extrabold text-foreground">{metrics.totalUsers}</span>
                  <span className="text-sm text-pink-600 flex items-center gap-1 mt-2 font-semibold">
                    <TrendingUp className="h-4 w-4" /> Cuentas registradas
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-card shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden ${metrics.lowStockItems > 0 ? 'border-red-500 dark:border-red-500/50' : 'border-border hover:border-slate-500/50'}`}>
              <CardContent className="p-6 flex flex-col justify-between h-full z-10">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <AlertTriangle className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Alertas de Stock</span>
                  <div className={`p-3 rounded-xl shadow-inner ${metrics.lowStockItems > 0 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-col mt-2 z-10">
                  <span className="text-4xl font-extrabold text-foreground">{metrics.lowStockItems}</span>
                  <Link href="/admin/alerts" className="text-sm text-blue-500 hover:text-blue-400 hover:underline mt-2 font-semibold transition-colors">
                    Ver productos a reponer
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">

            {/* Gráfico de Ingresos */}
            <Card className="lg:col-span-2 shadow-lg border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-extrabold">Historial de Ingresos</CardTitle>
                <CardDescription>Rendimiento financiero de los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#db2777" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #333', backgroundColor: '#000', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                        itemStyle={{ color: '#db2777', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#db2777" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Estado de Pedidos */}
            <Card className="shadow-lg border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-extrabold">Estado de Pedidos</CardTitle>
                <CardDescription>Distribución por estado actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.ordersByStatus}
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {metrics.ordersByStatus?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #333', backgroundColor: '#000' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 pb-12">

            {/* Top Productos (BarChart) */}
            <Card className="shadow-lg border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-extrabold">Productos Más Vendidos</CardTitle>
                <CardDescription>Top 5 piezas favoritas de los clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.topProducts}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip
                        cursor={{fill: '#1f2937', opacity: 0.4}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #333', backgroundColor: '#000' }}
                      />
                      <Bar dataKey="sold" fill="#cfa873" radius={[0, 4, 4, 0]} barSize={20}>
                        {metrics.topProducts?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#db2777' : '#cfa873'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Últimos Pedidos */}
            <Card className="shadow-lg border-border flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-extrabold">Pedidos Recientes</CardTitle>
                  <CardDescription>Últimas transacciones procesadas</CardDescription>
                </div>
                <Link href="/admin/sales">
                  <Button variant="outline" size="sm" className="text-xs border-pink-500/30 text-pink-400 hover:bg-pink-500/10">Ver Todos</Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1">
                {metrics.recentOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-4">
                    <ShoppingBag className="h-10 w-10 opacity-20" />
                    <p>No hay pedidos recientes.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {metrics.recentOrders.map((order, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-muted/50 transition-colors shadow-sm"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 font-bold shrink-0">
                            {order.customer_name ? order.customer_name.substring(0, 2).toUpperCase() : 'W'}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-sm truncate">{order.customer_name || 'Cliente WhatsApp'}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="font-extrabold text-sm text-emerald-400">S/ {Number(order.total).toFixed(2)}</span>
                          <Badge variant="outline" className="text-[10px] h-5 px-2 bg-background/50 backdrop-blur-sm">{order.status}</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : <div className="p-8 text-center"><p>No se pudieron cargar las estadísticas.</p><Button onClick={() => void fetchMetrics()}>Reintentar</Button></div>}
    </div>
  );
}
