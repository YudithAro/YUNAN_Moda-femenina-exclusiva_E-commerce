"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
type Notice = { id: number; message: string; kind: "success" | "error" };

export function FeedbackCenter() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const sequence = useRef(0);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const add = (message: string, kind: Notice["kind"]) => {
      const id = ++sequence.current;
      setNotices(current => [...current.filter(notice => notice.message !== message), { id, message, kind }].slice(-3));
      if (kind === "success") timers.push(setTimeout(() => setNotices(current => current.filter(notice => notice.id !== id)), 6000));
    };
    const error = (event: Event) => add((event as CustomEvent<string>).detail, "error");
    const success = (event: Event) => add((event as CustomEvent<string>).detail, "success");
    window.addEventListener("yunan:api-error", error);
    window.addEventListener("yunan:success", success);
    return () => { window.removeEventListener("yunan:api-error", error); window.removeEventListener("yunan:success", success); timers.forEach(clearTimeout); };
  }, []);
  return <div aria-label="Notificaciones" className="pointer-events-none fixed inset-x-3 bottom-4 z-[80] space-y-2 sm:left-auto sm:right-5 sm:w-[380px]">
    {notices.map(notice => <div key={notice.id} role={notice.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#222126] p-4 text-sm text-white shadow-xl ${notice.kind === "error" ? "border-rose-400/45" : "border-emerald-400/35"}`}>
      {notice.kind === "success" ? <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-300" /> : <CircleAlert size={20} className="mt-0.5 shrink-0 text-rose-300" />}
      <p className="flex-1 leading-6">{notice.message}</p><button type="button" aria-label="Cerrar notificación" onClick={() => setNotices(current => current.filter(item => item.id !== notice.id))} className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10"><X size={16} /></button>
    </div>)}
  </div>;
}
