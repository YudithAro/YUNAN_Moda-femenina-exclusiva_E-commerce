const shades: Record<string, string> = {
  negro: "#222125", blanco: "#f6f4ef", marfil: "#eee5cf", crema: "#e8ddc7",
  beige: "#cdb79b", arena: "#d8c7a6", camel: "#af8153", marron: "#755039",
  cafe: "#69442f", chocolate: "#4c3026", azul: "#416491", "azul marino": "#25334d",
  celeste: "#a2c9df", denim: "#527891", jean: "#527891", rosado: "#dfafbc",
  rosa: "#d99fb1", "palo rosa": "#c6979e", fucsia: "#bf3478", rojo: "#b6353c",
  vino: "#702b3c", guinda: "#632538", burgundy: "#632538", verde: "#5c775e",
  oliva: "#767747", "verde militar": "#60674c", menta: "#b3d5c3", amarillo: "#e5cb64",
  mostaza: "#b9943d", naranja: "#d88d56", coral: "#d58376", lila: "#b9a1d0",
  lavanda: "#c2b2d9", morado: "#806094", plomo: "#95969b", gris: "#999a9f",
  plateado: "#c4c5c9", dorado: "#c9aa67", nude: "#d3b49f", "gris oscuro": "#55565d",
};
export function ColorSwatch({ color, className = "" }: { color: string; className?: string }) {
  const normalized = color.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  const value = shades[normalized] || (/^#[a-f0-9]{6}$/i.test(color) ? color : undefined);
  return <span aria-hidden="true" className={`inline-block h-5 w-5 shrink-0 rounded-full border border-black/15 ring-1 ring-white/30 ${className}`}
    style={{ background: value || "repeating-linear-gradient(135deg,#c9c0b9 0 4px,#f0e9df 4px 8px)" }} />;
}
