import type { Metadata } from "next";
import { ProductCatalog } from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Colección | YUNAN",
  description: "Explora prendas de YUNAN por colección, talla, color y precio.",
};

export default function ColeccionPage() {
  return <ProductCatalog />;
}
