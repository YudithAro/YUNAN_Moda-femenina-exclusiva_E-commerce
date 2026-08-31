"use client";

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
import { ArrowLeft, AlertTriangle, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  stock: number;
  category: { name: string } | null;
}

export default function StockAlertsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = async () => {
    try {
      const res = await fetch("http://localhost:3000/products/low-stock");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

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
            <h2 className="text-3xl font-bold tracking-tight">Alertas de Stock</h2>
            <p className="text-muted-foreground mt-1">
              Productos con inventario crítico que requieren reabastecimiento.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-red-800 dark:text-red-400 font-bold text-2xl">{products.filter(p => p.stock === 0).length}</h3>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm font-medium">Agotados Completamente</p>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full dark:bg-amber-900/30">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-amber-800 dark:text-amber-400 font-bold text-2xl">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</h3>
            <p className="text-amber-600/80 dark:text-amber-400/80 text-sm font-medium">Stock Bajo (1 a 5 unidades)</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead>Nivel de Alerta</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Cargando inventario...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    ¡Tu inventario está perfecto! No hay alertas de stock bajo.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isCritical = product.stock > 0 && product.stock <= 5;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.category?.name || "General"}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-lg ${isOutOfStock ? 'text-red-600' : 'text-amber-600'}`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 gap-1.5">
                            <AlertCircle className="h-3 w-3" /> Agotado
                          </Badge>
                        ) : isCritical ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 gap-1.5">
                            <AlertTriangle className="h-3 w-3" /> Crítico
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 gap-1.5">
                            <AlertTriangle className="h-3 w-3" /> Bajo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/admin/products">
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            <ShoppingCart className="h-3 w-3 mr-1.5" />
                            Reponer
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
