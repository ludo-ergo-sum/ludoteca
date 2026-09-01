"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Search } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { inputBase } from "@/lib/ui";
import { copertinaPerGioco } from "@/lib/palette";
import { SelettoreMultiplo } from "@/components/SelettoreMultiplo";
import { EliminaGiocoButton } from "@/components/EliminaGiocoButton";
import { opzioniDistinte } from "@/lib/filtri";
import { btnSmall } from "@/lib/ui";

const PER_PAGINA = 20;

export function ListaGiochiAdmin({
  giochi,
  giocoIdsConCopieSospese,
}: {
  giochi: GiocoConDisponibilita[];
  giocoIdsConCopieSospese: string[];
}) {
  const [ricerca, setRicerca] = useState("");
  const [categorieSelezionate, setCategorieSelezionate] = useState<string[]>([]);
  const [meccanicheSelezionate, setMeccanicheSelezionate] = useState<string[]>([]);
  const [soloSenzaDisponibili, setSoloSenzaDisponibili] = useState(false);
  const [soloConSospese, setSoloConSospese] = useState(false);
  const [visibili, setVisibili] = useState(PER_PAGINA);
  const sentinellaRef = useRef<HTMLDivElement>(null);

  const sospeseSet = useMemo(() => new Set(giocoIdsConCopieSospese), [giocoIdsConCopieSospese]);
  const categorieDisponibili = useMemo(() => opzioniDistinte(giochi, (g) => g.categorie), [giochi]);
  const meccanicheDisponibili = useMemo(() => opzioniDistinte(giochi, (g) => g.meccaniche ?? []), [giochi]);

  const filtrati = useMemo(() => {
    const query = ricerca.trim().toLowerCase();
    return giochi.filter((g) => {
      const corrispondeTitolo = !query || g.titolo.toLowerCase().includes(query);
      const corrispondeCategoria =
        categorieSelezionate.length === 0 || g.categorie.some((c) => categorieSelezionate.includes(c));
      const corrispondeMeccanica =
        meccanicheSelezionate.length === 0 || (g.meccaniche ?? []).some((m) => meccanicheSelezionate.includes(m));
      const corrispondeDisponibilita = !soloSenzaDisponibili || g.copieDisponibili === 0;
      const corrispondeSospese = !soloConSospese || sospeseSet.has(g.id);
      return (
        corrispondeTitolo && corrispondeCategoria && corrispondeMeccanica && corrispondeDisponibilita && corrispondeSospese
      );
    });
  }, [giochi, ricerca, categorieSelezionate, meccanicheSelezionate, soloSenzaDisponibili, soloConSospese, sospeseSet]);

  const filtroAttuale = `${ricerca}|${categorieSelezionate.slice().sort().join(",")}|${meccanicheSelezionate
    .slice()
    .sort()
    .join(",")}|${soloSenzaDisponibili}|${soloConSospese}`;
  const [filtroPrecedente, setFiltroPrecedente] = useState(filtroAttuale);
  if (filtroAttuale !== filtroPrecedente) {
    setFiltroPrecedente(filtroAttuale);
    setVisibili(PER_PAGINA);
  }

  useEffect(() => {
    const sentinella = sentinellaRef.current;
    if (!sentinella) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibili((v) => Math.min(v + PER_PAGINA, filtrati.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinella);
    return () => observer.disconnect();
  }, [filtrati.length]);

  const daMostrare = filtrati.slice(0, visibili);
  const ciSonoAltri = visibili < filtrati.length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca per titolo..."
            className={`${inputBase} pl-9`}
            aria-label="Cerca un gioco per titolo"
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
        <button
          type="button"
          onClick={() => setSoloSenzaDisponibili((v) => !v)}
          aria-pressed={soloSenzaDisponibili}
          className={`${btnSmall} ${
            soloSenzaDisponibili
              ? "bg-coral text-card"
              : "border border-ink/20 text-ink/70 hover:border-coral hover:text-coral"
          }`}
        >
          Senza copie disponibili
        </button>
        <button
          type="button"
          onClick={() => setSoloConSospese((v) => !v)}
          aria-pressed={soloConSospese}
          className={`${btnSmall} ${
            soloConSospese
              ? "bg-amber text-ink"
              : "border border-ink/20 text-ink/70 hover:border-amber hover:text-amber-strong"
          }`}
        >
          Con copie sospese
        </button>
      </div>

      <p className="mt-3 text-sm text-ink/50">
        {filtrati.length} {filtrati.length === 1 ? "gioco" : "giochi"}
      </p>

      <div className="mt-3 space-y-3">
        {daMostrare.map((gioco) => {
          const copertina = copertinaPerGioco(gioco.id);
          return (
            <div key={gioco.id} className="hover-lift paper-card flex items-center gap-4 rounded-2xl p-4">
              <span
                className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl font-display text-lg font-bold"
                style={{ backgroundColor: copertina.bg, color: copertina.fg }}
              >
                {gioco.miniatura || gioco.immagine ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL esterna (BGG), niente next/image config per un solo campo remoto
                  <img
                    src={gioco.miniatura || gioco.immagine}
                    alt={gioco.titolo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  gioco.titolo.charAt(0)
                )}
              </span>
              <div className="flex-1">
                <p className="font-display text-lg text-ink">{gioco.titolo}</p>
                <p className="text-xs text-ink/50">
                  {gioco.copieDisponibili} disponibili su {gioco.copieTotali} copie
                </p>
              </div>
              <Link
                href={`/admin/giochi/${gioco.id}`}
                aria-label={`Modifica ${gioco.titolo}`}
                className="rounded-full p-2 text-ink/40 transition hover:bg-felt/8 hover:text-felt"
              >
                <Pencil size={16} />
              </Link>
              <EliminaGiocoButton giocoId={gioco.id} titolo={gioco.titolo} />
            </div>
          );
        })}
        {daMostrare.length === 0 && <p className="py-6 text-center text-sm text-ink/50">Nessun gioco trovato.</p>}
      </div>

      {ciSonoAltri && (
        <div ref={sentinellaRef} className="mt-6 text-center text-sm text-ink/40">
          Caricamento altri giochi...
        </div>
      )}
    </div>
  );
}
