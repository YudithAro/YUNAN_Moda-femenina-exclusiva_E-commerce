import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Clock,
  CreditCard,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotros y atención | YUNAN",
  description:
    "Conoce YUNAN y encuentra nuestros contactos, opciones de entrega y condiciones de atención.",
};

export default function NosotrosPage() {
  const phone = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51951162161"
  ).replace(/\D/g, "");
  const card = "rounded-2xl border border-white/10 bg-[#110810] p-6 md:p-8";
  const title =
    "mb-5 flex items-center gap-3 font-serif text-xl text-[#e3c193]";

  return (
    <div className="min-h-screen bg-[#050103] px-4 py-10 text-white md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#cfa873]">
            Nuestra esencia
          </p>
          <h1 className="font-serif text-4xl md:text-5xl">Sobre YUNAN</h1>
          <p className="mt-6 text-base leading-relaxed text-zinc-300 md:text-lg">
            Moda femenina para expresar tu estilo y sentirte segura. Explora
            nuestra colección y recibe atención personalizada para elegir tu
            próxima prenda.
          </p>
          <Link
            href="/coleccion"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#cfa873] px-6 text-sm font-semibold text-black hover:bg-[#e3c193]"
          >
            Explorar la colección
          </Link>
        </header>
        <h2 className="mb-6 font-serif text-2xl">Guía de atención</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <section className={card}>
            <h3 className={title}>
              <Phone size={22} /> Contacto
            </h3>
            <div className="space-y-5 text-sm leading-relaxed text-zinc-300">
              <div>
                <p className="font-semibold text-white">Pedidos y consultas</p>
                <a
                  className="inline-flex min-h-11 items-center text-lg text-[#e3c193] underline underline-offset-4"
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escríbenos por WhatsApp
                </a>
              </div>
              <div>
                <p className="font-semibold text-white">Solicitar recojo</p>
                <a
                  href="tel:+51942349822"
                  className="inline-flex min-h-11 items-center text-lg text-[#e3c193]"
                >
                  942 349 822
                </a>
                <p>Solicítalo hasta el sábado a la 1:00 p.m.</p>
              </div>
            </div>
          </section>
          <section className={card}>
            <h3 className={title}>
              <MapPin size={22} /> Entregas presenciales
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
              <p>
                <strong className="text-white">Días:</strong> domingos de 11:00
                a.m. a 12:00 p.m.
              </p>
              <p>
                <strong className="text-white">Lugar:</strong> Plaza de
                Cajamarca.
              </p>
              <p>Coordina el recojo con nuestro equipo antes de acercarte.</p>
            </div>
          </section>
          <section className={`${card} md:col-span-2`}>
            <h3 className={title}>
              <CreditCard size={22} /> Separaciones y pagos
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              La separación mínima es de S/ 5.00 mediante Yape. Puedes separar
              tu prenda, pagar el pedido completo o abonar un monto mayor al
              mínimo.
            </p>
            <div className="my-5 rounded-xl border border-[#cfa873]/30 bg-[#050103] p-5">
              <p className="text-sm text-zinc-300">Yape</p>
              <p className="mt-1 font-serif text-3xl text-[#e3c193]">
                951 162 161
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                A nombre de:{" "}
                <strong className="text-white">Yudith Arocutipa</strong>
              </p>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">
              Confirma tu selección y el total con nuestro equipo antes de
              realizar el pago.
            </p>
          </section>
          <section className={card}>
            <h3 className={title}>
              <Truck size={22} /> Envíos a provincias
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              Realizamos envíos a nivel nacional con la agencia de tu
              preferencia. Se aplica un adicional de S/ 3.00 por paquete.
              Consulta el costo de transporte y los plazos según tu destino.
            </p>
          </section>
          <section className={card}>
            <h3 className={title}>
              <Camera size={22} /> Pedidos en transmisiones
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              Toma una captura clara del modelo y envíala al número de pedidos
              por WhatsApp. Nuestro equipo confirmará talla, color y
              disponibilidad.
            </p>
          </section>
          <section className={card}>
            <h3 className={title}>
              <Clock size={22} /> Plazos y recojo
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
              <p>
                El plazo publicado para cancelar el saldo y recoger un pedido es
                de 30 días.
              </p>
              <p>
                Las condiciones publicadas indican que los pedidos sin pago o
                recojo se liberan sin devolución y que puede aplicarse un
                adicional de S/ 2.00 a S/ 3.00 por falta de recojo en fecha.
                Confirma las condiciones de tu pedido con el equipo.
              </p>
            </div>
          </section>
          <section className={card}>
            <h3 className={title}>
              <ShieldCheck size={22} /> Condiciones de la compra
            </h3>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
              <p>
                La política publicada de la tienda indica que no hay cambios ni
                devoluciones.
              </p>
              <p>
                La liberación voluntaria de una prenda tiene un costo publicado
                de S/ 5.00 por prenda. Consulta su aplicación antes de confirmar
                tu compra.
              </p>
            </div>
          </section>
          <section className={`${card} md:col-span-2`}>
            <h3 className={title}>
              <HeartHandshake size={22} /> Atención de reclamos
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              El horario publicado para reportar inconvenientes de un recojo es
              el mismo día, hasta las 6:00 p.m. del domingo. Escríbenos por
              WhatsApp con el detalle y la información de tu pedido.
            </p>
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-[#cfa873]/50 px-5 text-sm text-[#e3c193] hover:bg-[#cfa873]/10"
            >
              Contactar al equipo
            </a>
          </section>
        </div>
        <p className="mt-10 text-center font-serif text-xl text-[#e3c193]">
          Gracias por elegir YUNAN.
        </p>
      </div>
    </div>
  );
}
