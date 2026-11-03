# Supabase Root 2021 CA

`supabase-root-2021.crt` es un certificado raíz público, no una credencial.

Fuente publicada por Supabase Studio: [configuración oficial](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json).

Descarga: [certificado de producción](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt).

Huella SHA-256 del certificado (DER): `807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa`.

Válido hasta el 26 de abril de 2031. Solo se utiliza por defecto para conexiones PostgreSQL con dominios de Supabase; `DATABASE_SSL_CA` permite configurar otra CA. La verificación del certificado y del hostname permanece activa.
