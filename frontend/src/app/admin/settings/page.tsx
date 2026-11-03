"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson, getErrorMessage } from "@/lib/api";

type User = { id: string; name: string; email: string; role: string; createdAt: string };
export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { setUsers(await apiJson<User[]>("/users")); }
    catch (error) { setError(getErrorMessage(error)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void Promise.resolve().then(load); }, []);
  return <div className="space-y-6">
    <div className="flex items-center gap-4"><Link href="/admin"><Button variant="outline" size="icon" aria-label="Volver al panel"><ArrowLeft className="h-5 w-5" /></Button></Link><h1 className="text-3xl font-bold">Configuración y accesos</h1></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Acceso al panel</CardTitle><CardDescription>Consulta los permisos actuales de cada cuenta. Los cambios de permisos están reservados al responsable del sistema.</CardDescription></CardHeader>
      <CardContent>
        {error && <div role="alert" className="mb-4 space-y-2 text-red-600 dark:text-red-300"><p>{error}</p><Button variant="outline" onClick={() => void load()}>Reintentar</Button></div>}
        <Table><TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Correo</TableHead><TableHead>Acceso</TableHead><TableHead>Registro</TableHead></TableRow></TableHeader><TableBody>
          {loading ? <TableRow><TableCell colSpan={4}>Cargando cuentas...</TableCell></TableRow> : users.map(user => <TableRow key={user.id}><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell><Badge variant="outline">{user.role === "ADMIN" ? "Administrador" : "Cliente"}</Badge></TableCell><TableCell>{new Date(user.createdAt).toLocaleDateString("es-PE", { timeZone: "America/Lima" })}</TableCell></TableRow>)}
          {!loading && !error && !users.length && <TableRow><TableCell colSpan={4}>No hay cuentas registradas.</TableCell></TableRow>}
        </TableBody></Table>
      </CardContent>
    </Card>
  </div>;
}
