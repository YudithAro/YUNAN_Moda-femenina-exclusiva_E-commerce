import Image from "next/image";

// Fixed positions keep the original atmosphere stable during hydration.
const particles = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 37 + 7) % 100}%`,
  top: `${(index * 23 + 11) % 100}%`,
  size: 2 + (index % 4),
  duration: `${14 + (index % 13)}s`,
  delay: `${-(index % 17)}s`,
}));

export function StoreBackdrop() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030001]">
    <Image src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" alt="" fill sizes="100vw" className="object-cover opacity-[0.07] mix-blend-overlay" />
    <div className="absolute inset-0 bg-gradient-to-b from-[#030001]/90 via-[#030001]/60 to-[#030001]" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#030001] via-pink-950/20 to-[#030001]" />
    <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-pink-600/5 blur-[150px]" />
    <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-purple-900/10 blur-[150px]" />
    {particles.map((particle, index) => <span key={index} className="particle opacity-40" style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, animationDuration: particle.duration, animationDelay: particle.delay }} />)}
  </div>;
}
