"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { inputBase } from "@/lib/ui";
import { GameBoxCard } from "@/components/GameBoxCard";
import { SelettoreMultiplo } from "@/components/SelettoreMultiplo";
import { cercaCatalogoAction } from "@/lib/actions/games";

export const PER_PAGINA_CATALOGO = 10;

export function CatalogoGiochi({
  paginaIniziale,
  totaleIniziale,
  opzioniFiltro,
}: {
  paginaIniziale: GiocoConDisponibilita[];
  totaleIniziale: number;
  opzioniFiltro: { categorie: string[]; meccaniche: string[] };
}) {
  const [ricerca, setRicerca] = useState("");
  const [ricercaEffettiva, setRicercaEffettiva] = useState("");
  const [categorieSelezionate, setCategorieSelezionate] = useState<string[]>([]);
  const [meccanicheSelezionate, setMeccanicheSelezionate] = useState<string[]>([]);
  const [giochi, setGiochi] = useState(paginaIniziale);
  const [totale, setTotale] = useState(totaleIniziale);
  const [pagina, setPagina] = useState(1);
  const [caricando, setCaricando] = useState(false);
  const sentinellaRef = useRef<HTMLDivElement>(null);
  const richiestaCorrente = useRef(0);

  // Debounce della ricerca testuale: aspetta che l'utente finisca di
  // digitare prima di interrogare il db (niente query a ogni tasto).
  useEffect(() => {
    const timeout = setTimeout(() => setRicercaEffettiva(ricerca.trim()), 300);
    return () => clearTimeout(timeout);
  }, [ricerca]);

  const primoRender = useRef(true);

  // Ogni cambio di filtro riparte dalla prima pagina, richiesta al db (i
  // risultati mostrati finora restano visibili, appena sfumati, finche' non
  // arriva la risposta fresca: niente sfarfallio su una lista vuota).
  useEffect(() => {
    if (primoRender.current) {
      primoRender.current = false;
      return;
    }
    const id = ++richiestaCorrente.current;
    setCaricando(true);
    cercaCatalogoAction({
      ricerca: ricercaEffettiva || undefined,
      categorie: categorieSelezionate.length ? categorieSelezionate : undefined,
      meccaniche: meccanicheSelezionate.length ? meccanicheSelezionate : undefined,
      pagina: 1,
      perPagina: PER_PAGINA_CATALOGO,
    }).then((risultato) => {
      if (id !== richiestaCorrente.current) return; // superata da una richiesta piu' recente
      setGiochi(risultato.giochi);
      setTotale(risultato.totale);
      setPagina(1);
      setCaricando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ricercaEffettiva, categorieSelezionate, meccanicheSelezionate]);

  useEffect(() => {
    const sentinella = sentinellaRef.current;
    if (!sentinella) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || caricando || giochi.length >= totale) return;
        const id = ++richiestaCorrente.current;
        const prossimaPagina = pagina + 1;
        setCaricando(true);
        cercaCatalogoAction({
          ricerca: ricercaEffettiva || undefined,
          categorie: categorieSelezionate.length ? categorieSelezionate : undefined,
          meccaniche: meccanicheSelezionate.length ? meccanicheSelezionate : undefined,
          pagina: prossimaPagina,
          perPagina: PER_PAGINA_CATALOGO,
        }).then((risultato) => {
          if (id !== richiestaCorrente.current) return;
          setGiochi((precedenti) => [...precedenti, ...risultato.giochi]);
          setTotale(risultato.totale);
          setPagina(prossimaPagina);
          setCaricando(false);
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinella);
    return () => observer.disconnect();
  }, [pagina, giochi.length, totale, caricando, ricercaEffettiva, categorieSelezionate, meccanicheSelezionate]);

  const ciSonoAltri = giochi.length < totale;

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

        {opzioniFiltro.categorie.length > 0 && (
          <SelettoreMultiplo
            etichetta="Categorie"
            opzioni={opzioniFiltro.categorie}
            selezionati={categorieSelezionate}
            onChange={setCategorieSelezionate}
          />
        )}
        {opzioniFiltro.meccaniche.length > 0 && (
          <SelettoreMultiplo
            etichetta="Meccaniche"
            opzioni={opzioniFiltro.meccaniche}
            selezionati={meccanicheSelezionate}
            onChange={setMeccanicheSelezionate}
          />
        )}
      </div>

      <p className="mt-4 text-sm text-ink/50">
        {totale} {totale === 1 ? "gioco" : "giochi"}
      </p>

      <div className={`mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${caricando ? "opacity-60" : ""}`}>
        {giochi.map((gioco) => (
          <GameBoxCard key={gioco.id} gioco={gioco} />
        ))}
      </div>

      {giochi.length === 0 && !caricando && (
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
