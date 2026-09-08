"use client";

import { useEffect, useRef, useState } from "react";
import type { PrestitoConDettagli } from "@/lib/data/enriched";
import { BadgeStatoPrestito } from "@/components/StatusBadge";
import { cercaStoricoPrestitiAction } from "@/lib/actions/loans";

export const PER_PAGINA_STORICO_PRESTITI = 20;

export function StoricoPrestiti({
  prestitiIniziali,
  totaleIniziale,
}: {
  prestitiIniziali: PrestitoConDettagli[];
  totaleIniziale: number;
}) {
  const [prestiti, setPrestiti] = useState(prestitiIniziali);
  const [totale, setTotale] = useState(totaleIniziale);
  const [pagina, setPagina] = useState(1);
  const [caricando, setCaricando] = useState(false);
  const sentinellaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinella = sentinellaRef.current;
    if (!sentinella) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || caricando || prestiti.length >= totale) return;
        const prossimaPagina = pagina + 1;
        setCaricando(true);
        cercaStoricoPrestitiAction({ pagina: prossimaPagina, perPagina: PER_PAGINA_STORICO_PRESTITI }).then(
          (risultato) => {
            setPrestiti((precedenti) => [...precedenti, ...risultato.prestiti]);
            setTotale(risultato.totale);
            setPagina(prossimaPagina);
            setCaricando(false);
          }
        );
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinella);
    return () => observer.disconnect();
  }, [pagina, prestiti.length, totale, caricando]);

  const ciSonoAltri = prestiti.length < totale;

  return (
    <div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-paper-soft text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-2.5">Gioco</th>
              <th className="px-4 py-2.5">Copia</th>
              <th className="px-4 py-2.5">Socio</th>
              <th className="px-4 py-2.5">Richiesto</th>
              <th className="px-4 py-2.5">Restituito</th>
              <th className="px-4 py-2.5">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {prestiti.map((prestito) => (
              <tr key={prestito.id}>
                <td className="px-4 py-2.5">{prestito.gioco?.titolo}</td>
                <td className="px-4 py-2.5 font-mono-tag">{prestito.copia?.codice}</td>
                <td className="px-4 py-2.5">{prestito.socio?.nome}</td>
                <td className="px-4 py-2.5">{prestito.dataRichiesta}</td>
                <td className="px-4 py-2.5">{prestito.dataRestituzioneEffettiva ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <BadgeStatoPrestito stato={prestito.stato} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {prestiti.length === 0 && !caricando && (
          <p className="py-6 text-center text-sm text-ink/50">Nessun prestito concluso ancora.</p>
        )}
      </div>

      {ciSonoAltri && (
        <div ref={sentinellaRef} className="mt-4 text-center text-sm text-ink/40">
          Caricamento altri prestiti...
        </div>
      )}
    </div>
  );
}
