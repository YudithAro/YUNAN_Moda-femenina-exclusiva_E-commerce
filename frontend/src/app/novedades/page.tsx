import type { Metadata } from "next";
import { ProductCatalog } from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Nuevos ingresos | YUNAN",
  description: "Descubre las últimas prendas que llegaron a YUNAN.",
};

export default function NovedadesPage() {
  return <ProductCatalog mode="new" />;
}
