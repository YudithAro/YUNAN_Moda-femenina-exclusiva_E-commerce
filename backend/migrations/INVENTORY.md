# Inventario y ventas: actualización de noviembre de 2026

Aplicar `20261102_inventory_safety.sql` en Supabase antes de desplegar esta API en Render. El script es aditivo, usa una transacción y puede ejecutarse nuevamente. No ejecutar los scripts antiguos `migrate-supabase.js` o `migrate-data.js` para esta actualización: no son esta migración.

La migración conserva pedidos, productos, variantes y cantidades existentes. Si detecta combinaciones duplicadas, el índice único falla y la transacción se revierte; reconciliar esas filas y sus cantidades antes de reintentar. Las columnas `id`, `productId` y `orderId` del esquema existente son UUID, como en el script original de Supabase.

## Productos existentes

- Sin variantes: se conserva el inventario total y los listados antiguos de tallas/colores. No se inventa la distribución por combinación.
- Para controlar talla/color, introducir en el panel cada combinación y su cantidad real. El total del producto se calcula sumando sus variantes.
- Las combinaciones retiradas se conservan con cantidad cero para preservar el historial y permitir cancelaciones. Su identidad no puede editarse; agregar una combinación nueva cuando cambien talla o color.
- Si ya existían variantes, comprobar que su suma coincide con el total del producto antes de reabrir ventas; guardar las cantidades desde el panel las sincroniza.
- Antes de convertir un producto de inventario total a variantes, completar o cancelar sus ventas abiertas que reservaron cantidades sin variante. La API bloquea esa conversión para que una cancelación posterior no desajuste el total y sus combinaciones.

## Pedidos existentes

`inventoryReserved` queda en `false` para pedidos anteriores: la API no puede deducir si su inventario ya fue descontado ni si hubo ajustes manuales. Cancelarlos cambia el estado sin sumar unidades automáticamente. Revisar esos pedidos y ajustar su inventario según los movimientos reales. No marcar todos los pedidos históricos como reservados sin conciliación.

Las ventas nuevas reservan inventario en una única transacción. Se usa el precio guardado en PostgreSQL, cantidades enteras positivas y bloqueos de fila en orden consistente. Una cancelación recupera las unidades una sola vez. Los estados permitidos son `PENDING → PAID / CANCELLED`, `PAID → SHIPPED / CANCELLED` y `SHIPPED → DELIVERED`. Repetir el mismo estado es seguro; entregado y cancelado son terminales.

## Contrato API

Productos incluyen `variants: [{id, size, color, stock}]`. Crear o actualizar acepta `variants: [{id?, size?, color?, stock}]`. Si el producto tiene variantes, la venta debe indicar `variantId`.

`POST /orders/manual` acepta `{ customerName, customerPhone?, requestId?, items: [{ productId, variantId?, quantity }] }`. `requestId` es un UUID generado una vez por formulario; conservarlo hasta confirmar la respuesta. Reintentar el mismo contenido devuelve el mismo pedido; reutilizar la clave con otro contenido devuelve un conflicto. El campo de precio enviado por el cliente se ignora.

La venta se registra pagada porque corresponde al registro manual de una venta ya cobrada; abrir WhatsApp no crea ni cobra un pedido.
