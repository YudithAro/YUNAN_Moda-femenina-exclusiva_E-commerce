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
import { ArrowLeft, Mail, UserCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/users`);
      const data = await res.json();
      // Filter out admins if you only want to see standard customers, or keep everyone.
      // Let's keep everyone but highlight roles.
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground mt-1">
              Gestiona los usuarios registrados en tu tienda.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Usuario</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Total Gastado</TableHead>
                <TableHead className="text-right">Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Cargando clientes...</TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No hay clientes registrados todavía.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center dark:bg-pink-900/30">
                          <UserCircle className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{customer.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(customer.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.orderCount > 0 ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20">{customer.orderCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      S/ {Number(customer.totalSpent).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.role === "ADMIN" ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20">Administrador</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-200">Cliente</Badge>
                      )}
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
