"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { inputBase } from "@/lib/ui";
import { GameBoxCard } from "@/components/GameBoxCard";
import { SelettoreMultiplo } from "@/components/SelettoreMultiplo";
import { opzioniDistinte } from "@/lib/filtri";

const PER_PAGINA = 10;

export function CatalogoGiochi({ giochi }: { giochi: GiocoConDisponibilita[] }) {
  const [ricerca, setRicerca] = useState("");
  const [categorieSelezionate, setCategorieSelezionate] = useState<string[]>([]);
  const [meccanicheSelezionate, setMeccanicheSelezionate] = useState<string[]>([]);
  const [visibili, setVisibili] = useState(PER_PAGINA);
  const sentinellaRef = useRef<HTMLDivElement>(null);

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
      return corrispondeTitolo && corrispondeCategoria && corrispondeMeccanica;
    });
  }, [giochi, ricerca, categorieSelezionate, meccanicheSelezionate]);

  const filtroAttuale = `${ricerca}|${categorieSelezionate.slice().sort().join(",")}|${meccanicheSelezionate
    .slice()
    .sort()
    .join(",")}`;
  const [filtroPrecedente, setFiltroPrecedente] = useState(filtroAttuale);

  // Ogni cambio di ricerca o filtro riparte dalla prima pagina di risultati
  // (aggiustamento di stato durante il render, non in un effetto: evita un
  // render in piu').
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
        <div className="relative w-full min-w-[200px] flex-1">
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
      </div>

      <p className="mt-4 text-sm text-ink/50">
        {filtrati.length} {filtrati.length === 1 ? "gioco" : "giochi"}
      </p>

      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {daMostrare.map((gioco) => (
          <GameBoxCard key={gioco.id} gioco={gioco} />
        ))}
      </div>

      {daMostrare.length === 0 && (
        <p className="mt-8 text-center text-sm text-ink/50">Nessun gioco trovato.</p>
      )}

      {ciSonoAltri && (
        <div ref={sentinellaRef} className="mt-8 text-center text-sm text-ink/40">
          Caricamento altri giochi...
        </div>
      )}
    </div>
  );
}
