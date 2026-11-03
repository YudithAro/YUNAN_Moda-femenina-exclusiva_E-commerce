"use client";

import { useEffect, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ConfirmationRequest } from '@/lib/confirm-action';

type Pending = ConfirmationRequest & { resolve: (confirmed: boolean) => void };

export function ActionConfirmation() {
  const [pending, setPending] = useState<Pending | null>(null);
  useEffect(() => {
    let active: Pending | null = null;
    const listener = (event: Event) => {
      event.preventDefault();
      active?.resolve(false);
      active = (event as CustomEvent<Pending>).detail;
      setPending(active);
    };
    window.addEventListener('yunan:confirm', listener);
    return () => { window.removeEventListener('yunan:confirm', listener); active?.resolve(false); };
  }, []);
  function finish(confirmed: boolean) { pending?.resolve(confirmed); setPending(null); }
  return <Dialog open={!!pending} onOpenChange={open => { if (!open) finish(false); }}>
    <DialogContent className="sm:max-w-md">
      <CircleAlert size={25} className="text-rose-300" />
      <DialogHeader><DialogTitle className="text-lg">{pending?.title}</DialogTitle><DialogDescription className="leading-7">{pending?.description}</DialogDescription></DialogHeader>
      <div className="mt-2 flex justify-end gap-3"><button type="button" onClick={() => finish(false)} className="admin-secondary-button">Conservar</button><button type="button" onClick={() => finish(true)} className="min-h-11 rounded-xl bg-rose-500 px-4 text-sm font-medium text-white hover:bg-rose-400">{pending?.confirmLabel || 'Eliminar'}</button></div>
    </DialogContent>
  </Dialog>;
}
