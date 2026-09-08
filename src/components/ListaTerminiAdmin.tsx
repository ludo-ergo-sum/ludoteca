"use client";

import { useEffect, useRef, useState } from "react";
import type { TerminBgg, TipoTermineBgg } from "@/lib/types";
import { FormTraduzioneTermine } from "@/components/FormTraduzioneTermine";
import { cercaTerminiAction } from "@/lib/actions/terminiBgg";

export const PER_PAGINA_TERMINI = 20;

type FiltroTraduzione = "tutti" | "da_tradurre" | "tradotte";
type FiltroDescrizione = "tutti" | "con_descrizione" | "senza_descrizione";

const TAB_TRADUZIONE: [FiltroTraduzione, string][] = [
  ["tutti", "Tutti"],
  ["da_tradurre", "Da tradurre"],
  ["tradotte", "Tradotte"],
];

const TAB_DESCRIZIONE: [FiltroDescrizione, string][] = [
  ["tutti", "Tutte"],
  ["con_descrizione", "Con descrizione"],
  ["senza_descrizione", "Senza descrizione"],
];

export function ListaTerminiAdmin({
  tipo,
  titolo,
  terminiIniziali,
  totaleIniziale,
}: {
  tipo: TipoTermineBgg;
  titolo: string;
  terminiIniziali: TerminBgg[];
  totaleIniziale: number;
}) {
  const [filtroTraduzione, setFiltroTraduzione] = useState<FiltroTraduzione>("tutti");
  const [filtroDescrizione, setFiltroDescrizione] = useState<FiltroDescrizione>("tutti");
  const [termini, setTermini] = useState(terminiIniziali);
  const [totale, setTotale] = useState(totaleIniziale);
  const [pagina, setPagina] = useState(1);
  const [caricando, setCaricando] = useState(false);
  const sentinellaRef = useRef<HTMLDivElement>(null);
  const richiestaCorrente = useRef(0);
  const primoRender = useRef(true);

  const daRitradurre = filtroTraduzione === "tutti" ? undefined : filtroTraduzione === "da_tradurre";
  const conDescrizione = filtroDescrizione === "tutti" ? undefined : filtroDescrizione === "con_descrizione";

  // Cambio tab/filtro: query db-side (stesso pattern di CatalogoGiochi), non
  // un .filter() in memoria sull'intero vocabolario di categorie/meccaniche.
  useEffect(() => {
    if (primoRender.current) {
      primoRender.current = false;
      return;
    }
    const id = ++richiestaCorrente.current;
    setCaricando(true);
    cercaTerminiAction({ tipo, daRitradurre, conDescrizione, pagina: 1, perPagina: PER_PAGINA_TERMINI }).then(
      (risultato) => {
        if (id !== richiestaCorrente.current) return;
        setTermini(risultato.termini);
        setTotale(risultato.totale);
        setPagina(1);
        setCaricando(false);
      }
    );
  }, [tipo, daRitradurre, conDescrizione]);

  useEffect(() => {
    const sentinella = sentinellaRef.current;
    if (!sentinella) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || caricando || termini.length >= totale) return;
        const id = ++richiestaCorrente.current;
        const prossimaPagina = pagina + 1;
        setCaricando(true);
        cercaTerminiAction({
          tipo,
          daRitradurre,
          conDescrizione,
          pagina: prossimaPagina,
          perPagina: PER_PAGINA_TERMINI,
        }).then((risultato) => {
          if (id !== richiestaCorrente.current) return;
          setTermini((precedenti) => [...precedenti, ...risultato.termini]);
          setTotale(risultato.totale);
          setPagina(prossimaPagina);
          setCaricando(false);
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinella);
    return () => observer.disconnect();
  }, [pagina, termini.length, totale, caricando, tipo, daRitradurre, conDescrizione]);

  if (totale === 0 && termini.length === 0 && !caricando) return null;

  const ciSonoAltri = termini.length < totale;

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink">{titolo}</h2>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {TAB_TRADUZIONE.map(([valore, etichetta]) => (
          <button
            key={valore}
            type="button"
            onClick={() => setFiltroTraduzione(valore)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filtroTraduzione === valore
                ? "border-felt bg-felt/8 text-felt"
                : "border-ink/20 text-ink/70 hover:border-felt hover:text-felt"
            }`}
          >
            {etichetta}
          </button>
        ))}
        {TAB_DESCRIZIONE.map(([valore, etichetta]) => (
          <button
            key={valore}
            type="button"
            onClick={() => setFiltroDescrizione(valore)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filtroDescrizione === valore
                ? "border-amber bg-amber/10 text-amber-strong"
                : "border-ink/20 text-ink/70 hover:border-amber hover:text-amber-strong"
            }`}
          >
            {etichetta}
          </button>
        ))}
      </div>

      <div className={`mt-3 space-y-2 ${caricando && termini.length === 0 ? "opacity-60" : ""}`}>
        {termini.map((t) => (
          <FormTraduzioneTermine key={`${t.tipo}-${t.nomeInglese}`} termine={t} />
        ))}
        {termini.length === 0 && !caricando && (
          <p className="py-4 text-sm text-ink/50">Nessun termine corrisponde al filtro selezionato.</p>
        )}
      </div>

      {ciSonoAltri && (
        <div ref={sentinellaRef} className="mt-4 text-center text-sm text-ink/40">
          Caricamento altri termini...
        </div>
      )}
    </section>
  );
}
