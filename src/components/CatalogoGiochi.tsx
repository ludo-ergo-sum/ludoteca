"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { btnSmall, inputBase } from "@/lib/ui";
import { GameBoxCard } from "@/components/GameBoxCard";

const PER_PAGINA = 10;

export function CatalogoGiochi({ giochi }: { giochi: GiocoConDisponibilita[] }) {
  const [ricerca, setRicerca] = useState("");
  const [categorieSelezionate, setCategorieSelezionate] = useState<string[]>([]);
  const [visibili, setVisibili] = useState(PER_PAGINA);
  const sentinellaRef = useRef<HTMLDivElement>(null);

  const categorieDisponibili = useMemo(
    () => Array.from(new Set(giochi.flatMap((g) => g.categorie))).sort((a, b) => a.localeCompare(b)),
    [giochi]
  );

  const filtrati = useMemo(() => {
    const query = ricerca.trim().toLowerCase();
    return giochi.filter((g) => {
      const corrispondeTitolo = !query || g.titolo.toLowerCase().includes(query);
      const corrispondeCategoria =
        categorieSelezionate.length === 0 || g.categorie.some((c) => categorieSelezionate.includes(c));
      return corrispondeTitolo && corrispondeCategoria;
    });
  }, [giochi, ricerca, categorieSelezionate]);

  const filtroAttuale = `${ricerca}|${categorieSelezionate.slice().sort().join(",")}`;
  const [filtroPrecedente, setFiltroPrecedente] = useState(filtroAttuale);

  // Ogni cambio di ricerca o categoria riparte dalla prima pagina di
  // risultati (aggiustamento di stato durante il render, non in un
  // effetto: evita un render in piu').
  if (filtroAttuale !== filtroPrecedente) {
    setFiltroPrecedente(filtroAttuale);
    setVisibili(PER_PAGINA);
  }

  function toggleCategoria(categoria: string) {
    setCategorieSelezionate((prec) =>
      prec.includes(categoria) ? prec.filter((c) => c !== categoria) : [...prec, categoria]
    );
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
      <div className="relative max-w-sm">
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
        <div className="mt-3 flex flex-wrap gap-2">
          {categorieDisponibili.map((categoria) => {
            const selezionata = categorieSelezionate.includes(categoria);
            return (
              <button
                key={categoria}
                type="button"
                onClick={() => toggleCategoria(categoria)}
                aria-pressed={selezionata}
                className={`${btnSmall} ${
                  selezionata
                    ? "bg-felt text-card"
                    : "border border-ink/20 text-ink/70 hover:border-felt hover:text-felt"
                }`}
              >
                {categoria}
              </button>
            );
          })}
          {categorieSelezionate.length > 0 && (
            <button
              type="button"
              onClick={() => setCategorieSelezionate([])}
              className={`${btnSmall} text-ink/50 underline-offset-2 hover:text-felt hover:underline`}
            >
              Azzera filtri
            </button>
          )}
        </div>
      )}

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
