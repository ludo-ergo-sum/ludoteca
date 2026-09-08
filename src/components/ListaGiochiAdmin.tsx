"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pencil, Search } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { inputBase } from "@/lib/ui";
import { copertinaPerGioco } from "@/lib/palette";
import { SelettoreMultiplo } from "@/components/SelettoreMultiplo";
import { EliminaGiocoButton } from "@/components/EliminaGiocoButton";
import { cercaGiochiAdminAction } from "@/lib/actions/games";
import { btnSmall } from "@/lib/ui";

export const PER_PAGINA_GIOCHI_ADMIN = 20;

export function ListaGiochiAdmin({
  giochiIniziali,
  totaleIniziale,
  opzioniFiltro,
}: {
  giochiIniziali: GiocoConDisponibilita[];
  totaleIniziale: number;
  opzioniFiltro: { categorie: string[]; meccaniche: string[] };
}) {
  const [ricerca, setRicerca] = useState("");
  const [ricercaEffettiva, setRicercaEffettiva] = useState("");
  const [categorieSelezionate, setCategorieSelezionate] = useState<string[]>([]);
  const [meccanicheSelezionate, setMeccanicheSelezionate] = useState<string[]>([]);
  const [soloSenzaDisponibili, setSoloSenzaDisponibili] = useState(false);
  const [soloConSospese, setSoloConSospese] = useState(false);
  const [giochi, setGiochi] = useState(giochiIniziali);
  const [totale, setTotale] = useState(totaleIniziale);
  const [pagina, setPagina] = useState(1);
  const [caricando, setCaricando] = useState(false);
  const sentinellaRef = useRef<HTMLDivElement>(null);
  const richiestaCorrente = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => setRicercaEffettiva(ricerca.trim()), 300);
    return () => clearTimeout(timeout);
  }, [ricerca]);

  const primoRender = useRef(true);

  // Ogni cambio di filtro riparte dalla prima pagina, richiesta al db (stesso
  // pattern di CatalogoGiochi): niente piu' un .filter() in memoria
  // sull'intero catalogo caricato una volta per tutte.
  useEffect(() => {
    if (primoRender.current) {
      primoRender.current = false;
      return;
    }
    const id = ++richiestaCorrente.current;
    setCaricando(true);
    cercaGiochiAdminAction({
      ricerca: ricercaEffettiva || undefined,
      categorie: categorieSelezionate.length ? categorieSelezionate : undefined,
      meccaniche: meccanicheSelezionate.length ? meccanicheSelezionate : undefined,
      senzaDisponibili: soloSenzaDisponibili || undefined,
      conSospese: soloConSospese || undefined,
      pagina: 1,
      perPagina: PER_PAGINA_GIOCHI_ADMIN,
    }).then((risultato) => {
      if (id !== richiestaCorrente.current) return;
      setGiochi(risultato.giochi);
      setTotale(risultato.totale);
      setPagina(1);
      setCaricando(false);
    });
  }, [ricercaEffettiva, categorieSelezionate, meccanicheSelezionate, soloSenzaDisponibili, soloConSospese]);

  useEffect(() => {
    const sentinella = sentinellaRef.current;
    if (!sentinella) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || caricando || giochi.length >= totale) return;
        const id = ++richiestaCorrente.current;
        const prossimaPagina = pagina + 1;
        setCaricando(true);
        cercaGiochiAdminAction({
          ricerca: ricercaEffettiva || undefined,
          categorie: categorieSelezionate.length ? categorieSelezionate : undefined,
          meccaniche: meccanicheSelezionate.length ? meccanicheSelezionate : undefined,
          senzaDisponibili: soloSenzaDisponibili || undefined,
          conSospese: soloConSospese || undefined,
          pagina: prossimaPagina,
          perPagina: PER_PAGINA_GIOCHI_ADMIN,
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
  }, [pagina, giochi.length, totale, caricando, ricercaEffettiva, categorieSelezionate, meccanicheSelezionate, soloSenzaDisponibili, soloConSospese]);

  const ciSonoAltri = giochi.length < totale;

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

      <p className={`mt-3 text-sm text-ink/50 ${caricando ? "opacity-60" : ""}`}>
        {totale} {totale === 1 ? "gioco" : "giochi"}
      </p>

      <div className={`mt-3 space-y-3 ${caricando && giochi.length === 0 ? "opacity-60" : ""}`}>
        {giochi.map((gioco) => {
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
        {giochi.length === 0 && !caricando && (
          <p className="py-6 text-center text-sm text-ink/50">Nessun gioco trovato.</p>
        )}
      </div>

      {ciSonoAltri && (
        <div ref={sentinellaRef} className="mt-6 text-center text-sm text-ink/40">
          Caricamento altri giochi...
        </div>
      )}
    </div>
  );
}
