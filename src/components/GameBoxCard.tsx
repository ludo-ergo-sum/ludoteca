import Link from "next/link";
import { Users, Clock, Baby, Info, Calendar } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { copertinaPerGioco } from "@/lib/palette";
import { formattaIntervallo } from "@/lib/format";

export function GameBoxCard({ gioco }: { gioco: GiocoConDisponibilita }) {
  const copertina = copertinaPerGioco(gioco.id);
  const esaurito = gioco.copieDisponibili === 0;

  return (
    <Link
      href={`/giochi/${gioco.slug}`}
      className="hover-lift group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card"
    >
      <div
        className="relative flex h-40 items-center justify-center overflow-hidden"
        style={{ backgroundColor: copertina.bg }}
      >
        {gioco.immagine ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL esterna (BGG), niente next/image config per un solo campo remoto
          <img src={gioco.immagine} alt={gioco.titolo} className="h-full w-full object-cover" />
        ) : (
          <span
            className="font-display text-7xl font-bold opacity-90"
            style={{ color: copertina.fg }}
          >
            {gioco.titolo.charAt(0)}
          </span>
        )}
        <span
          className="absolute inset-0 border-b-8"
          style={{ borderColor: copertina.ring }}
          aria-hidden
        />
        <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {esaurito ? "Non disponibile" : "Prenotabile"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">{gioco.titolo}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {gioco.categorie.map((categoria) => (
              <span key={categoria} className="rounded-full bg-felt/8 px-2 py-0.5 text-[11px] font-medium text-felt">
                {categoria}
              </span>
            ))}
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-ink/70">{gioco.descrizione}</p>

        {gioco.meccaniche && gioco.meccaniche.length > 0 && (
          <div className="group/info relative inline-flex w-fit items-center gap-1 text-xs text-ink/50">
            <Info size={14} />
            Meccaniche
            <div className="absolute bottom-full left-0 z-20 mb-1.5 w-56 rounded-xl border border-ink/10 bg-card p-3 text-xs text-ink/70 opacity-0 shadow-lg transition-opacity duration-150 group-hover/info:opacity-100">
              <p className="mb-1.5 font-mono-tag text-[10px] uppercase tracking-widest text-ink/40">Meccaniche</p>
              <ul className="space-y-1">
                {gioco.meccaniche.slice(0, 4).map((meccanica) => (
                  <li key={meccanica}>{meccanica}</li>
                ))}
              </ul>
              {gioco.meccaniche.length > 4 && (
                <p className="mt-1 text-ink/40">+{gioco.meccaniche.length - 4} altre</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 border-t border-ink/10 pt-3 text-xs text-ink/60">
          <span className="inline-flex items-center gap-1">
            <Users size={14} /> {formattaIntervallo(gioco.giocatoriMin, gioco.giocatoriMax)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {formattaIntervallo(gioco.durataMinutiMin, gioco.durataMinutiMax)}′
          </span>
          <span className="inline-flex items-center gap-1">
            <Baby size={14} /> {gioco.etaMinima}+
          </span>
          {gioco.anno && (
            <span className="ml-auto inline-flex items-center gap-1">
              <Calendar size={14} /> {gioco.anno}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
