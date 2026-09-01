"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { QuotaAnnuale } from "@/lib/types";
import { BadgeSocioInRegola } from "@/components/StatusBadge";
import { btnOutline, btnSmall, inputBase } from "@/lib/ui";

const PER_PAGINA = 5;

export function StoricoQuote({ quote }: { quote: QuotaAnnuale[] }) {
  const [aperto, setAperto] = useState(false);
  const [ricerca, setRicerca] = useState("");
  const [pagina, setPagina] = useState(0);

  const quoteOrdinate = useMemo(() => [...quote].sort((a, b) => b.anno - a.anno), [quote]);

  const filtrate = useMemo(() => {
    const query = ricerca.trim();
    if (!query) return quoteOrdinate;
    return quoteOrdinate.filter((q) => String(q.anno).includes(query));
  }, [quoteOrdinate, ricerca]);

  // Ogni nuova ricerca riparte dalla prima pagina (aggiustamento di stato
  // durante il render, non in un effetto: evita un render in piu').
  const [ricercaPrecedente, setRicercaPrecedente] = useState(ricerca);
  if (ricerca !== ricercaPrecedente) {
    setRicercaPrecedente(ricerca);
    setPagina(0);
  }

  const totalePagine = Math.max(1, Math.ceil(filtrate.length / PER_PAGINA));
  const paginaSicura = Math.min(pagina, totalePagine - 1);
  const visibili = filtrate.slice(paginaSicura * PER_PAGINA, paginaSicura * PER_PAGINA + PER_PAGINA);

  if (quote.length === 0) return null;

  return (
    <>
      <button type="button" onClick={() => setAperto(true)} className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
        Vedi lo storico completo
      </button>

      {aperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setAperto(false)}
        >
          <div
            className="paper-card w-full max-w-md rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Storico quote associative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">Storico quote associative</h3>
              <button
                type="button"
                onClick={() => setAperto(false)}
                aria-label="Chiudi"
                className="text-ink/50 hover:text-felt"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mt-4">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                inputMode="numeric"
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                placeholder="Cerca un anno..."
                className={`${inputBase} pl-8`}
                aria-label="Cerca una quota per anno"
              />
            </div>

            <ul className="mt-4 min-h-[220px] divide-y divide-dashed divide-ink/15">
              {visibili.map((q) => (
                <li key={q.anno} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-display text-lg text-ink">{q.anno}</span>
                  <BadgeSocioInRegola inRegola={q.inRegola} />
                  <span className="font-mono-tag text-xs text-ink/50">
                    {q.dataRegistrazione ? `registrata il ${q.dataRegistrazione}` : "non registrata"}
                  </span>
                  {q.note && <span className="w-full text-xs text-ink/50">{q.note}</span>}
                </li>
              ))}
              {visibili.length === 0 && <li className="py-3 text-sm text-ink/50">Nessun anno trovato.</li>}
            </ul>

            {totalePagine > 1 && (
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  disabled={paginaSicura === 0}
                  onClick={() => setPagina((p) => p - 1)}
                  className={`${btnSmall} border border-ink/20 text-ink/70 hover:border-felt hover:text-felt`}
                >
                  Precedente
                </button>
                <span className="text-xs text-ink/50">
                  Pagina {paginaSicura + 1} di {totalePagine}
                </span>
                <button
                  type="button"
                  disabled={paginaSicura >= totalePagine - 1}
                  onClick={() => setPagina((p) => p + 1)}
                  className={`${btnSmall} border border-ink/20 text-ink/70 hover:border-felt hover:text-felt`}
                >
                  Successiva
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
