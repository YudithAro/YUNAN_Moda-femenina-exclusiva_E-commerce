# Verificación local — 2 de noviembre de 2026

- Backend: lint y compilación correctos; 108 pruebas unitarias y 6 pruebas HTTP aprobadas.
- Conexión PostgreSQL: los parámetros TLS de la URL no anulan la verificación ni la CA configurada; tamaño del pool validado entre 1 y 50.
- Frontend en Next.js 16.4.4: lint, tipos, compilación y comprobación del navegador en producción correctos.
- Auditorías de dependencias de producción: 0 vulnerabilidades tanto en backend como en frontend.
- Arranque del backend compilado comprobado: `/health` devuelve 200 y las rutas privadas sin sesión devuelven 401.
- PostgreSQL descartable: las migraciones de inventario y acceso se aplicaron dos veces; comprobados precios del servidor, sobreventa, rollback, reintentos, cancelación única y conservación del historial.
- Acceso SQL: RLS habilitado; `PUBLIC`, `anon` y `authenticated` sin acceso directo a las tablas comerciales; propietario/API conservan acceso.
- Chrome con datos simulados: catálogo, filtros, errores/reintento, variantes, cantidades, WhatsApp y tamaños de 320 a 1440 px comprobados.
- Las capturas en `storefront/` usan productos simulados e imágenes de prueba, no el catálogo real.

No se probaron múltiples conexiones PostgreSQL compitiendo simultáneamente. Las pruebas SQL usaron PGlite con un solo cliente.

Las migraciones de producción se aplicaron posteriormente, bajo la autorización de despliegue del usuario, mediante Session Pooler IPv4 con TLS verificado. Se guardó un respaldo privado fuera del repositorio. Los datos originales de las ocho tablas comerciales, sus 20 productos, 21 pedidos y stock total de 358 unidades conservaron los mismos valores. El acceso directo anónimo quedó bloqueado; la API existente siguió sirviendo el catálogo.

La publicación del código en Render/Vercel se verifica por separado después de este paso de base de datos.
