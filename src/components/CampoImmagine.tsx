"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { inputBase } from "@/lib/ui";

export function CampoImmagine({ id, name, defaultValue }: { id: string; name: string; defaultValue: string }) {
  const [valore, setValore] = useState(defaultValue);
  const [aperto, setAperto] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        name={name}
        value={valore}
        onChange={(e) => setValore(e.target.value)}
        className={`${inputBase} flex-1`}
      />
      {valore && (
        <button
          type="button"
          onClick={() => setAperto(true)}
          aria-label="Vedi anteprima immagine"
          className="flex-none rounded-lg border border-ink/15 p-2.5 text-ink/50 transition hover:border-felt hover:text-felt"
        >
          <ImageIcon size={16} />
        </button>
      )}

      {aperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setAperto(false)}
        >
          <div
            className="paper-card max-h-[85vh] max-w-lg overflow-auto rounded-2xl p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Anteprima immagine"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL esterna, anteprima libera */}
            <img src={valore} alt="Anteprima" className="max-h-[70vh] w-full rounded-xl object-contain" />
            <button
              type="button"
              onClick={() => setAperto(false)}
              className="mt-3 text-xs text-ink/50 hover:text-felt hover:underline"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
