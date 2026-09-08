"use client";

import { useEffect, useRef, useState } from "react";
import type { RichiestaAcquistoConDettagli } from "@/lib/data/enriched";
import { cercaStoricoRichiesteAction } from "@/lib/actions/richiesteAcquisto";

export const PER_PAGINA_STORICO_RICHIESTE = 20;

export function StoricoRichieste({
  richiesteIniziali,
  totaleIniziale,
}: {
  richiesteIniziali: RichiestaAcquistoConDettagli[];
  totaleIniziale: number;
}) {
  const [richieste, setRichieste] = useState(richiesteIniziali);
  const [totale, setTotale] = useState(totaleIniziale);
  const [pagina, setPagina] = useState(1);
  const [caricando, setCaricando] = useState(false);
  const sentinellaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinella = sentinellaRef.current;
    if (!sentinella) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || caricando || richieste.length >= totale) return;
        const prossimaPagina = pagina + 1;
        setCaricando(true);
        cercaStoricoRichiesteAction({ pagina: prossimaPagina, perPagina: PER_PAGINA_STORICO_RICHIESTE }).then(
          (risultato) => {
            setRichieste((precedenti) => [...precedenti, ...risultato.richieste]);
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
  }, [pagina, richieste.length, totale, caricando]);

  const ciSonoAltri = richieste.length < totale;

  if (richieste.length === 0 && !caricando) {
    return <p className="mt-3 text-sm text-ink/60">Nessuna richiesta gestita ancora.</p>;
  }

  return (
    <div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-paper-soft text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-2.5">Espansione</th>
              <th className="px-4 py-2.5">Gioco base</th>
              <th className="px-4 py-2.5">Socio</th>
              <th className="px-4 py-2.5">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {richieste.map((richiesta) => (
              <tr key={richiesta.id}>
                <td className="px-4 py-2.5">{richiesta.titolo}</td>
                <td className="px-4 py-2.5">{richiesta.giocoBaseTitolo}</td>
                <td className="px-4 py-2.5">{richiesta.autoreNome}</td>
                <td className="px-4 py-2.5">{richiesta.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ciSonoAltri && (
        <div ref={sentinellaRef} className="mt-4 text-center text-sm text-ink/40">
          Caricamento altre richieste...
        </div>
      )}
    </div>
  );
}
