"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

// Bottone submit generico da usare dentro un <form action={serverAction}>:
// mostra uno spinner e si disabilita mentre l'azione e' in corso, cosi' chi
// clicca capisce che qualcosa sta succedendo anche quando l'azione impiega
// piu' di un istante (es. invio di un'email di notifica).
export function BottoneInvio({ className, children }: { className: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
