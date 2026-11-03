# YUNAN — tienda de moda femenina

La arquitectura se mantiene: **Next.js en Vercel**, **NestJS en Render** y **PostgreSQL, Auth y Storage en Supabase**. Las ventas se coordinan por WhatsApp y se registran como pagadas desde el panel cuando el pago ya está confirmado.

## Cambios incluidos

- API privada por defecto: sesión validada con Supabase y rol de administrador obtenido de la tabla `user`. Catálogo y categorías se consultan públicamente.
- El navegador envía el token actual; no se autorizan cuentas mediante listas de correos ni datos de identidad enviados en el formulario.
- Ventas con precios del servidor, transacciones, bloqueo de stock, variantes por talla/color y reintentos sin pedidos duplicados.
- Cancelación con recuperación de existencias una sola vez e historial de variantes conservado.
- Catálogo compartido con filtros reales, ordenamiento, errores con reintento y estados vacíos distintos.
- WhatsApp incluye producto, opciones, cantidad y enlace. Las combinaciones agotadas se deshabilitan.
- Panel con errores visibles, detalle de pedidos, estados de envío válidos y formularios validados.
- Imágenes optimizadas, adaptación a celular y eliminación de reseñas y métricas ficticias.
- Un solo pool PostgreSQL por instancia de Render, sin contraseñas de respaldo en el código.

## Desarrollo local

Usar Node.js 24 y npm. Copiar `backend/.env.example` a `backend/.env` y `frontend/.env.example` a `frontend/.env.local`, completando los valores reales. No publicar estos archivos privados.

```powershell
cd backend
npm ci
npm run start:dev
```

En otra terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Frontend: `http://localhost:4000`. Backend: `http://localhost:3000`.

## Actualización de Supabase, Render y Vercel

Estos cambios de código no despliegan servicios automáticamente. El orden de actualización evita que la API nueva consulte columnas que todavía no existen.

1. **Supabase:** disponer de una copia de seguridad y revisar [las notas de inventario](backend/migrations/INVENTORY.md). Aplicar, en este orden:
   - [20261102_inventory_safety.sql](backend/migrations/20261102_inventory_safety.sql).
   - [20261102_api_access.sql](backend/migrations/20261102_api_access.sql).
2. **Render:** configurar las variables siguientes y desplegar el backend. Build: `npm ci && npm run build`; inicio: `npm run start:prod`; directorio raíz: `backend`; health check: `/health`.
3. **Vercel:** configurar las variables públicas siguientes y desplegar el frontend. Directorio raíz: `frontend`; framework: Next.js; build: `npm run build`.
4. Comprobar catálogo público, inicio de sesión del administrador, una venta de prueba y su cancelación.

También se pueden ejecutar las dos migraciones mediante una conexión administrativa desde el backend, después de compilar:

```powershell
npm run build
npm run migrate:safe -- --check
npm run migrate:safe
```

`--check` solo verifica conexión y presencia de columnas de inventario. Las migraciones se pueden repetir y conservan los registros existentes. Usar conexión directa o **Session Pooler (5432)** para migrar; no Transaction Pooler (6543).

### Variables del backend en Render

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Conexión PostgreSQL de Supabase; rol propietario de las tablas o con `BYPASSRLS`. |
| `DATABASE_POOL_MAX` | `5` inicialmente por instancia; ajustar al límite contratado. |
| `DATABASE_SSL` | `true` |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `true` |
| `DATABASE_SSL_CA` | Certificado CA de Supabase si la conexión lo requiere; admite `\\n` literales. |
| `SUPABASE_URL` | URL del mismo proyecto Supabase usado por el frontend. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada, utilizada exclusivamente en el servidor para Storage. |
| `SUPABASE_ANON_KEY` | Opcional: clave pública para validar sesiones con `getUser`. |
| `CORS_ORIGINS` | URL exacta del frontend, por ejemplo `https://tu-tienda.vercel.app`; varios dominios separados por comas. |

Render proporciona `PORT`. Agregar dominios propios o previews a `CORS_ORIGINS` explícitamente si deben usar la API. La verificación TLS permanece activa; si falta un certificado, configurar la CA antes de desplegar.

El servicio Render existente reconoce su hostname y permite por defecto únicamente el dominio actual de Vercel. Para otro servicio de producción se exige `CORS_ORIGINS`. El certificado raíz público de Supabase se incluye en `backend/certs`; `DATABASE_SSL_CA` permite sustituirlo si el proveedor cambia su CA. El arranque en Render verifica las columnas necesarias antes de aceptar tráfico.

Los parámetros SSL de `DATABASE_URL` se normalizan para que no descarten la CA ni cambien la política TLS. Configurar esas opciones mediante `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED` y `DATABASE_SSL_CA`. El tamaño del pool admite entre 1 y 50 conexiones; valor inicial 5.

La migración de acceso habilita RLS y retira permisos directos de `PUBLIC`, `anon` y `authenticated` sobre las tablas comerciales. El navegador accede a ellas mediante Render. El propietario y los roles con permisos explícitos/BYPASSRLS conservan acceso. El bucket público `products` sigue sirviendo fotografías; no se modifican sus políticas con esta migración.

### Variables del frontend en Vercel

- `NEXT_PUBLIC_API_URL`: URL HTTPS del servicio Render.
- `NEXT_PUBLIC_SUPABASE_URL`: URL de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública anon/publishable.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número internacional sin símbolos; valor actual por defecto `51951162161`.

La clave `service_role` y `DATABASE_URL` pertenecen únicamente al backend. Volver a desplegar Vercel después de modificar variables `NEXT_PUBLIC_*`. En Supabase Auth, configurar Site URL y URLs de redirección con los dominios reales.

## Administradores y cuentas anteriores

Una cuenta debe existir en Supabase Auth y tener el correo confirmado. El rol real se almacena en `public."user".role` y el ID debe coincidir con `auth.users.id`.

Para asignar el rol a una cuenta verificada, desde el backend compilado:

```powershell
$env:ADMIN_EMAIL = "correo-del-administrador@example.com"
npm run admin:grant
```

El comando verifica la identidad en Supabase y no crea contraseñas. Los antiguos scripts de creación de administradores ahora delegan a este comando. Si el mismo correo conserva un perfil con un ID anterior, el sistema lo bloquea para evitar transferir permisos o historial automáticamente: vincular ese perfil y sus pedidos con el ID verificado antes de asignar el rol.

No se admiten cambios de rol desde el formulario del navegador.

## Inventario anterior y pedidos

No se inventa la distribución del stock existente entre tallas y colores: completar las cantidades reales de cada combinación desde el panel. Los productos sin variantes mantienen su stock total.

Los pedidos anteriores reciben `inventoryReserved=false`; cancelarlos no agrega unidades automáticamente porque no puede saberse si su inventario ya fue descontado. Conciliar esos pedidos antes de ajustar existencias. Las ventas nuevas sí reservan stock y lo devuelven una sola vez al cancelar.

Estados válidos:

```text
PENDING → PAID o CANCELLED
PAID → SHIPPED o CANCELLED
SHIPPED → DELIVERED
```

Entregado y cancelado son terminales. Abrir WhatsApp no crea un pedido ni confirma un pago.

## Verificación

Backend:

```powershell
npm run lint
npm run build
npm test
npm run test:e2e
npm audit --omit=dev
```

Frontend:

```powershell
npm run lint
npm run build
```

GitHub Actions ejecuta estos controles al recibir cambios. Las pruebas automatizadas del backend usan dobles de prueba, sin escrituras en Supabase real. Se validaron además las migraciones y las consultas de inventario sobre PostgreSQL descartable y el catálogo móvil con datos simulados.

Los archivos de `src/prisma/contract.*` y los scripts antiguos de migración son material heredado; la aplicación usa SQL con `pg`. Para esta actualización usar únicamente las migraciones SQL indicadas, no regenerar la base con scripts históricos.

Las auditorías de dependencias de producción quedaron sin avisos conocidos al finalizar la revisión. Se conservaron las herramientas de desarrollo con avisos moderados cuya solución automática requería cambios incompatibles; no se ejecutaron actualizaciones forzadas.
