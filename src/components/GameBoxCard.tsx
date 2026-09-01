import Link from "next/link";
import { Users, Clock, Baby } from "lucide-react";
import type { GiocoConDisponibilita } from "@/lib/types";
import { copertinaPerGioco } from "@/lib/palette";

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
        <span
          className="font-display text-7xl font-bold opacity-90"
          style={{ color: copertina.fg }}
        >
          {gioco.titolo.charAt(0)}
        </span>
        <span
          className="absolute inset-0 border-b-8"
          style={{ borderColor: copertina.ring }}
          aria-hidden
        />
        <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {esaurito ? "Tutte in prestito" : `${gioco.copieDisponibili} disponibili`}
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

        <div className="mt-auto flex items-center gap-4 border-t border-ink/10 pt-3 text-xs text-ink/60">
          <span className="inline-flex items-center gap-1">
            <Users size={14} /> {gioco.giocatoriMin}-{gioco.giocatoriMax}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {gioco.durataMinutiMin}-{gioco.durataMinutiMax}′
          </span>
          <span className="inline-flex items-center gap-1">
            <Baby size={14} /> {gioco.etaMinima}+
          </span>
        </div>
      </div>
    </Link>
  );
}
