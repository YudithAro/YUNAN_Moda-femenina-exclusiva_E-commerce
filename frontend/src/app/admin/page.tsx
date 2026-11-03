"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CircleDollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiJson, getErrorMessage } from "@/lib/api";
import { money } from "@/lib/products";
import { useAdminRefresh } from "@/lib/use-admin-refresh";

interface Metrics {
  totalRevenue: number; totalOrders: number; totalUsers: number; lowStockItems: number;
  monthlyRevenue: { name: string; total: number }[];
  ordersByStatus: { name: string; value: number }[];
  topProducts: { name: string; sold: number }[];
  recentOrders: { id: string; total: string; status: string; createdAt: string; customer_name: string | null }[];
}
const statusNames: Record<string, string> = { PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };
const statusStyles: Record<string, string> = { PENDING: "bg-amber-400/10 text-amber-200", PAID: "bg-emerald-400/10 text-emerald-200", SHIPPED: "bg-sky-400/10 text-sky-200", DELIVERED: "bg-emerald-400/10 text-emerald-200", CANCELLED: "bg-zinc-400/10 text-zinc-300" };
const date = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: "America/Lima" });

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    try { setMetrics(await apiJson<Metrics>("/dashboard/metrics")); setError(""); }
    catch (reason) { setError(getErrorMessage(reason)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void Promise.resolve().then(load); }, []);
  useAdminRefresh(load);

  if (loading) return <div role="status" className="space-y-6"><div className="h-9 w-56 animate-pulse rounded-lg bg-white/10" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(item => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/5" />)}</div><p className="text-sm text-zinc-400">Cargando el resumen de tu tienda...</p></div>;
  if (!metrics) return <div role="alert" className="rounded-2xl border border-rose-400/30 p-8"><h1 className="text-2xl font-semibold">No pudimos cargar el resumen</h1><p className="my-4 text-sm text-zinc-300">{error}</p><button className="admin-secondary-button" onClick={() => void load()}>Reintentar</button></div>;

  const cards = [
    { label: "Ingresos confirmados", value: money(metrics.totalRevenue), note: "Pedidos pagados, enviados y entregados", icon: CircleDollarSign, href: "/admin/sales" },
    { label: "Pedidos", value: metrics.totalOrders, note: "Todos los estados", icon: ShoppingBag, href: "/admin/sales" },
    { label: "Clientes", value: metrics.totalUsers, note: "Cuentas registradas", icon: Users, href: "/admin/customers" },
    { label: "Stock por revisar", value: metrics.lowStockItems, note: metrics.lowStockItems ? "Prendas con 10 unidades o menos" : "Sin alertas de stock bajo", icon: Package, href: "/admin/alerts" },
  ];
  return <div className="space-y-7">
    <div><p className="mb-2 text-sm text-zinc-400">Tu negocio, de un vistazo</p><h1 className="text-3xl font-semibold tracking-tight">Resumen de la tienda</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Consulta tus ventas, revisa el inventario y organiza los pedidos.</p></div>
    {error && <p role="alert" className="rounded-xl border border-rose-400/25 p-4 text-sm text-rose-200">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => {
      const Icon = card.icon;
      return <Link key={card.label} href={card.href} className="rounded-2xl border border-white/10 bg-[#19191e] p-5 transition-colors hover:border-white/25">
        <div className="flex items-center justify-between gap-2 text-sm text-zinc-300"><span>{card.label}</span><Icon size={18} className="shrink-0 text-zinc-400" /></div>
        <p className="mt-5 text-3xl font-semibold tracking-tight">{card.value}</p><p className="mt-2 text-xs leading-5 text-zinc-400">{card.note}</p>
      </Link>;
    })}</div>

    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-[#19191e] p-5 sm:p-6" aria-labelledby="revenue-title">
        <div className="mb-6 flex items-center justify-between gap-4"><div><h2 id="revenue-title" className="text-base font-semibold">Ingresos por mes</h2><p className="mt-1 text-xs text-zinc-400">Últimos 6 meses · ventas confirmadas</p></div><span className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-400">Soles</span></div>
        {metrics.monthlyRevenue.length ? <div className="h-64 min-w-0 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={metrics.monthlyRevenue} margin={{ top: 10, left: 5, right: 10, bottom: 0 }}>
              <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c3b7a4" stopOpacity={0.2} /><stop offset="100%" stopColor="#c3b7a4" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#ffffff" opacity={0.07} />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ backgroundColor: "#25252b", border: "1px solid #44444c", borderRadius: 12, color: "white" }} formatter={value => [money(Number(value)), "Ingresos"]} />
              <Area dataKey="total" type="monotone" stroke="#d5c7b3" strokeWidth={2} fill="url(#revenue-fill)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div> : <div className="flex h-64 items-center justify-center text-sm text-zinc-400">Todavía no hay ventas confirmadas en este período.</div>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#19191e] p-5 sm:p-6" aria-labelledby="status-title">
        <h2 id="status-title" className="text-base font-semibold">Estado de los pedidos</h2><p className="mt-1 text-xs text-zinc-400">Distribución actual</p>
        <div className="mt-6 space-y-5">{metrics.ordersByStatus?.length ? metrics.ordersByStatus.map(status => <div key={status.name}>
          <div className="mb-2 flex justify-between text-sm"><span className="text-zinc-300">{statusNames[status.name] || status.name}</span><span className="font-medium">{status.value}</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-zinc-400" style={{ width: `${Math.max(2, status.value / Math.max(1, metrics.totalOrders) * 100)}%` }} /></div>
        </div>) : <p className="text-sm text-zinc-400">Aún no hay pedidos registrados.</p>}</div>
        <Link href="/admin/shipping" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-200">Gestionar envíos<ArrowRight size={15} /></Link>
      </section>
    </div>

    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#19191e]">
        <div className="flex items-center justify-between gap-3 px-5 py-5 sm:px-6"><h2 className="text-base font-semibold">Pedidos recientes</h2><Link href="/admin/sales" className="inline-flex min-h-9 items-center gap-1 text-xs text-zinc-300">Ver todos<ArrowRight size={14} /></Link></div>
        {metrics.recentOrders.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-white/5 text-xs text-zinc-400"><tr><th className="px-5 py-3 font-normal sm:px-6">Cliente</th><th className="px-3 py-3 font-normal">Estado</th><th className="px-5 py-3 text-right font-normal sm:px-6">Total</th></tr></thead><tbody>
          {metrics.recentOrders.map(order => <tr key={order.id} className="border-b border-white/5 last:border-0"><td className="px-5 py-4 sm:px-6"><p className="max-w-48 truncate">{order.customer_name || "Cliente WhatsApp"}</p><p className="mt-1 text-xs text-zinc-400">{date.format(new Date(order.createdAt))}</p></td><td className="px-3 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${statusStyles[order.status] || "bg-white/5 text-zinc-300"}`}>{statusNames[order.status] || order.status}</span></td><td className="whitespace-nowrap px-5 py-4 text-right font-medium sm:px-6">{money(order.total)}</td></tr>)}
        </tbody></table></div> : <div className="px-6 pb-8 text-sm text-zinc-400">Tus próximas ventas aparecerán aquí.</div>}
      </section>
      <section className="rounded-2xl border border-white/10 bg-[#19191e] p-5 sm:p-6"><h2 className="text-base font-semibold">Prendas más vendidas</h2><p className="mt-1 text-xs text-zinc-400">Unidades en ventas confirmadas</p>
        <ol className="mt-5 divide-y divide-white/5">{metrics.topProducts?.map((product, index) => <li key={product.name} className="flex items-center gap-3 py-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-zinc-400">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm text-zinc-300">{product.name}</span><strong className="text-sm">{product.sold}</strong></li>)}</ol>
        {!metrics.topProducts?.length && <p className="mt-5 text-sm text-zinc-400">Registra una venta para conocer tus prendas favoritas.</p>}
        {metrics.lowStockItems > 0 && <Link href="/admin/alerts" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 p-4 text-sm text-amber-100"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{metrics.lowStockItems} {metrics.lowStockItems === 1 ? "prenda necesita" : "prendas necesitan"} revisión de stock.</span></Link>}
      </section>
    </div>
  </div>;
}
