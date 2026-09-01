"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { inputBase } from "@/lib/ui";

export function SelettoreMultiplo({
  etichetta,
  opzioni,
  selezionati,
  onChange,
}: {
  etichetta: string;
  opzioni: string[];
  selezionati: string[];
  onChange: (selezionati: string[]) => void;
}) {
  const [aperto, setAperto] = useState(false);
  const [ricerca, setRicerca] = useState("");
  const contenitoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aperto) return;
    function chiudiSeFuori(e: MouseEvent) {
      if (contenitoreRef.current && !contenitoreRef.current.contains(e.target as Node)) {
        setAperto(false);
      }
    }
    document.addEventListener("mousedown", chiudiSeFuori);
    return () => document.removeEventListener("mousedown", chiudiSeFuori);
  }, [aperto]);

  const opzioniFiltrate = useMemo(() => {
    const query = ricerca.trim().toLowerCase();
    if (!query) return opzioni;
    return opzioni.filter((o) => o.toLowerCase().includes(query));
  }, [opzioni, ricerca]);

  function toggleOpzione(opzione: string) {
    onChange(selezionati.includes(opzione) ? selezionati.filter((o) => o !== opzione) : [...selezionati, opzione]);
  }

  return (
    <div ref={contenitoreRef} className="relative">
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        aria-expanded={aperto}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
          selezionati.length > 0
            ? "border-felt bg-felt/8 text-felt"
            : "border-ink/20 text-ink/70 hover:border-felt hover:text-felt"
        }`}
      >
        {etichetta}
        {selezionati.length > 0 && (
          <span className="rounded-full bg-felt px-1.5 py-0.5 text-[10px] text-card">{selezionati.length}</span>
        )}
        <ChevronDown size={13} />
      </button>

      {aperto && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-ink/10 bg-card p-3 shadow-lg">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder={`Cerca...`}
              autoFocus
              className={`${inputBase} py-1.5 pl-8 text-xs`}
            />
          </div>

          <ul className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
            {opzioniFiltrate.map((opzione) => (
              <li key={opzione}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-ink/5">
                  <input
                    type="checkbox"
                    checked={selezionati.includes(opzione)}
                    onChange={() => toggleOpzione(opzione)}
                    className="h-3.5 w-3.5 rounded border-ink/30 text-felt focus:ring-felt"
                  />
                  {opzione}
                </label>
              </li>
            ))}
            {opzioniFiltrate.length === 0 && (
              <li className="px-2 py-1.5 text-sm text-ink/40">Nessun risultato.</li>
            )}
          </ul>

          {selezionati.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-2 inline-flex items-center gap-1 text-xs text-ink/50 hover:text-felt hover:underline"
            >
              <X size={12} /> Azzera selezione
            </button>
          )}
        </div>
      )}
    </div>
  );
}
