"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Search, Ticket } from "lucide-react";
import type { PrestitoConDettagli } from "@/lib/data/enriched";
import { BadgeStatoPrestito } from "@/components/StatusBadge";
import { SelettoreMultiplo } from "@/components/SelettoreMultiplo";
import { annullaPrestitoAction } from "@/lib/actions/loans";
import { btnOutline, btnSmall, inputBase } from "@/lib/ui";
import { opzioniDistinte } from "@/lib/filtri";

const PER_PAGINA = 5;

export function TabsPrestiti({
  attivi,
  storico,
  giochiRecensiti,
}: {
  attivi: PrestitoConDettagli[];
  storico: PrestitoConDettagli[];
  giochiRecensiti: string[];
}) {
  const [tab, setTab] = useState<"attivi" | "storico">("attivi");

  const [ricerca, setRicerca] = useState("");
  const [categorieSelezionate, setCategorieSelezionate] = useState<string[]>([]);
  const [meccanicheSelezionate, setMeccanicheSelezionate] = useState<string[]>([]);
  const [pagina, setPagina] = useState(0);

  const categorieDisponibili = useMemo(
    () => opzioniDistinte(storico, (p) => p.gioco?.categorie ?? []),
    [storico]
  );
  const meccanicheDisponibili = useMemo(
    () => opzioniDistinte(storico, (p) => p.gioco?.meccaniche ?? []),
    [storico]
  );

  const storicoFiltrato = useMemo(() => {
    const query = ricerca.trim().toLowerCase();
    return storico.filter((p) => {
      const corrispondeTitolo = !query || (p.gioco?.titolo ?? "").toLowerCase().includes(query);
      const corrispondeCategoria =
        categorieSelezionate.length === 0 ||
        (p.gioco?.categorie ?? []).some((c) => categorieSelezionate.includes(c));
      const corrispondeMeccanica =
        meccanicheSelezionate.length === 0 ||
        (p.gioco?.meccaniche ?? []).some((m) => meccanicheSelezionate.includes(m));
      return corrispondeTitolo && corrispondeCategoria && corrispondeMeccanica;
    });
  }, [storico, ricerca, categorieSelezionate, meccanicheSelezionate]);

  // Ogni cambio di ricerca/filtro riparte dalla prima pagina (aggiustamento
  // di stato durante il render, non in un effetto: evita un render in piu').
  const filtroAttuale = `${ricerca}|${categorieSelezionate.slice().sort().join(",")}|${meccanicheSelezionate
    .slice()
    .sort()
    .join(",")}`;
  const [filtroPrecedente, setFiltroPrecedente] = useState(filtroAttuale);
  if (filtroAttuale !== filtroPrecedente) {
    setFiltroPrecedente(filtroAttuale);
    setPagina(0);
  }

  const totalePagine = Math.max(1, Math.ceil(storicoFiltrato.length / PER_PAGINA));
  const paginaSicura = Math.min(pagina, totalePagine - 1);
  const storicoVisibile = storicoFiltrato.slice(
    paginaSicura * PER_PAGINA,
    paginaSicura * PER_PAGINA + PER_PAGINA
  );

  return (
    <section className="mt-10">
      <div className="flex items-center gap-1 border-b border-ink/10">
        <button
          type="button"
          onClick={() => setTab("attivi")}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition ${
            tab === "attivi" ? "border-felt text-ink" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          <Ticket size={16} /> In corso e richieste
          {attivi.length > 0 && (
            <span className="rounded-full bg-felt/10 px-2 py-0.5 text-xs text-felt">{attivi.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("storico")}
          className={`ml-4 flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition ${
            tab === "storico" ? "border-felt text-ink" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          <CalendarClock size={16} /> Storico
        </button>
      </div>

      {tab === "attivi" &&
        (attivi.length === 0 ? (
          <p className="mt-5 text-sm text-ink/60">Non hai prestiti attivi in questo momento.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {attivi.map((prestito) => (
              <div
                key={prestito.id}
                className="ticket-notch paper-card flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
              >
                <div>
                  <p className="font-display text-lg text-ink">{prestito.gioco?.titolo ?? "Gioco"}</p>
                  <p className="font-mono-tag text-xs text-ink/50">
                    {prestito.copia?.codice} · richiesto il {prestito.dataRichiesta}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeStatoPrestito stato={prestito.stato} />
                  {prestito.stato === "in_attesa" && (
                    <form action={annullaPrestitoAction}>
                      <input type="hidden" name="prestitoId" value={prestito.id} />
                      <button type="submit" className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
                        Annulla richiesta
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === "storico" &&
        (storico.length === 0 ? (
          <p className="mt-5 text-sm text-ink/60">Ancora nessun prestito concluso.</p>
        ) : (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                />
                <input
                  type="search"
                  value={ricerca}
                  onChange={(e) => setRicerca(e.target.value)}
                  placeholder="Cerca per titolo del gioco..."
                  className={`${inputBase} pl-9`}
                  aria-label="Cerca nello storico prestiti per titolo"
                />
              </div>
              {categorieDisponibili.length > 0 && (
                <SelettoreMultiplo
                  etichetta="Categorie"
                  opzioni={categorieDisponibili}
                  selezionati={categorieSelezionate}
                  onChange={setCategorieSelezionate}
                />
              )}
              {meccanicheDisponibili.length > 0 && (
                <SelettoreMultiplo
                  etichetta="Meccaniche"
                  opzioni={meccanicheDisponibili}
                  selezionati={meccanicheSelezionate}
                  onChange={setMeccanicheSelezionate}
                />
              )}
            </div>

            <p className="mt-3 text-sm text-ink/50">
              {storicoFiltrato.length} {storicoFiltrato.length === 1 ? "prestito" : "prestiti"}
            </p>

            <div className="mt-3 space-y-3">
              {storicoVisibile.map((prestito) => (
                <div
                  key={prestito.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-card/60 p-4"
                >
                  <div>
                    <p className="font-display text-base text-ink">{prestito.gioco?.titolo ?? "Gioco"}</p>
                    <p className="font-mono-tag text-xs text-ink/50">
                      {prestito.copia?.codice} · richiesto il {prestito.dataRichiesta}
                      {prestito.dataRestituzioneEffettiva && ` · restituito il ${prestito.dataRestituzioneEffettiva}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {prestito.stato === "restituito" &&
                      prestito.gioco &&
                      !giochiRecensiti.includes(prestito.gioco.id) && (
                        <Link
                          href={`/giochi/${prestito.gioco.slug}#recensione`}
                          className="text-xs font-medium text-felt underline hover:no-underline"
                        >
                          Vota questo gioco
                        </Link>
                      )}
                    <BadgeStatoPrestito stato={prestito.stato} />
                  </div>
                </div>
              ))}
              {storicoVisibile.length === 0 && (
                <p className="py-3 text-sm text-ink/50">Nessun prestito trovato.</p>
              )}
            </div>

            {totalePagine > 1 && (
              <div className="mt-4 flex items-center justify-between">
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
        ))}
    </section>
  );
}
