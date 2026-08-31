"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, UserCog, Settings, ShieldCheck, Mail, Database } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await fetch(`http://localhost:3000/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
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
            <h2 className="text-3xl font-bold tracking-tight">Configuración y Accesos</h2>
            <p className="text-muted-foreground mt-1">
              Administra los permisos de tu equipo y preferencias generales.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Izquierdo: Ajustes Generales (Visual) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-pink-600" /> Ajustes de la Tienda
              </CardTitle>
              <CardDescription>Configuración básica del negocio (Ejemplo visual)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la Tienda</label>
                <Input defaultValue="YUNAN Tienda de Ropa" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Correo de Contacto</label>
                <Input defaultValue="contacto@yunan.com" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Moneda Principal</label>
                <Select defaultValue="PEN">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">Soles (S/)</SelectItem>
                    <SelectItem value="USD">Dólares ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                Guardar Ajustes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" /> Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg text-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold">Estado de Conexión</p>
                  <p className="text-muted-foreground">PostgreSQL v16 - Activo</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Derecho: Gestión de Roles */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Control de Accesos (Roles)
              </CardTitle>
              <CardDescription>Define quién tiene acceso a este panel de administración.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[300px]">Usuario</TableHead>
                    <TableHead>Nivel de Acceso actual</TableHead>
                    <TableHead className="text-right">Cambiar Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10">Cargando usuarios...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        No hay usuarios registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                              <UserCog className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{user.name}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.role === "ADMIN" ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20">Administrador</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-200">Usuario (Cliente)</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(val) => handleRoleChange(user.id, val)}
                          >
                            <SelectTrigger className="h-8 w-[140px] text-xs ml-auto">
                              <SelectValue placeholder="Asignar Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">Convertir a Usuario</SelectItem>
                              <SelectItem value="ADMIN" className="text-purple-600 font-medium">Dar acceso ADMIN</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
