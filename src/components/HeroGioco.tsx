"use client";

import { useState } from "react";
import { Baby, Clock, Heart, MessageSquare, Sparkles, Star, Users } from "lucide-react";
import { formattaIntervallo, formattaNumeroCompatto } from "@/lib/format";

const MOSTRATI_CREDITS = 3;

interface Copertina {
  bg: string;
  fg: string;
}

export function HeroGioco({
  immagine,
  titolo,
  copertina,
  giocatoriMin,
  giocatoriMax,
  durataMinutiMin,
  durataMinutiMax,
  etaMinima,
  anno,
  difficolta,
  bggValutazioneMedia,
  bggNumeroVoti,
  votoLes,
  votoLesNumero,
  numeroPreferiti,
  descrizione,
  autore,
  editore,
  illustratori,
}: {
  immagine: string;
  titolo: string;
  copertina: Copertina;
  giocatoriMin: number;
  giocatoriMax: number;
  durataMinutiMin: number;
  durataMinutiMax: number;
  etaMinima: number;
  anno?: number;
  difficolta: 1 | 2 | 3 | 4 | 5;
  bggValutazioneMedia?: number | null;
  bggNumeroVoti?: number | null;
  votoLes?: number | null;
  votoLesNumero?: number;
  numeroPreferiti: number;
  descrizione: string;
  autore?: string[];
  editore?: string[];
  illustratori?: string[];
}) {
  const [tab, setTab] = useState<"overview" | "credits">("overview");

  return (
    <>
      {/* Riga 1: hero a piena larghezza (occupa entrambe le colonne della grid
          della pagina da "lg" in su, dove la spalla categorie/meccaniche compare
          solo nella riga 2). */}
      <div
        className="relative lg:col-span-2 rounded-3xl p-6 sm:p-8"
        style={{ backgroundColor: `${copertina.bg}14` }}
      >
        <div className="absolute right-6 top-6 flex gap-4 sm:right-8 sm:top-8">
          <VotoMini etichetta="Voto BGG" valore={bggValutazioneMedia} />
          <VotoMini etichetta="Voto LES" valore={votoLes} />
        </div>

        <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
          <div
            className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl"
            style={{ backgroundColor: copertina.bg }}
          >
            {immagine ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL esterna (BGG), niente next/image config per un solo campo remoto
              <img src={immagine} alt={titolo} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-7xl font-bold opacity-90" style={{ color: copertina.fg }}>
                {titolo.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {titolo}
              {anno && <span className="font-normal text-ink/40"> ({anno})</span>}
            </h1>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox icona={Users} etichetta="Giocatori" valore={formattaIntervallo(giocatoriMin, giocatoriMax)} />
              <StatBox
                icona={Clock}
                etichetta="Durata"
                valore={`${formattaIntervallo(durataMinutiMin, durataMinutiMax)} min`}
              />
              <StatBox icona={Baby} etichetta="Età" valore={`${etaMinima}+`} />
              <StatBox
                icona={Sparkles}
                etichetta="Difficoltà"
                valore={"●".repeat(difficolta) + "○".repeat(5 - difficolta)}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-ink/60">
              <span className="inline-flex items-center gap-1.5">
                <Star size={15} className="text-amber-strong" />
                {formattaNumeroCompatto(bggNumeroVoti ?? 0)} voti BGG
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare size={15} className="text-felt" />
                {votoLesNumero ?? 0} voti LES
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart size={15} className="text-coral" />
                {numeroPreferiti} nei preferiti
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              {autore && autore.length > 0 && (
                <RigaCredits etichetta="Designer" valori={autore} onVediTutti={() => setTab("credits")} />
              )}
              {illustratori && illustratori.length > 0 && (
                <RigaCredits etichetta="Illustratori" valori={illustratori} onVediTutti={() => setTab("credits")} />
              )}
              {editore && editore.length > 0 && (
                <RigaCredits etichetta="Editore" valori={editore} onVediTutti={() => setTab("credits")} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Riga 2, colonna sinistra: le tab, affiancate dalla spalla categorie/meccaniche
          (renderizzata dal chiamante come secondo figlio della stessa grid). */}
      <div>
        <div className="flex items-center gap-1 border-b border-ink/10">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              tab === "overview" ? "border-felt text-ink" : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setTab("credits")}
            className={`ml-4 border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              tab === "credits" ? "border-felt text-ink" : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            Credits
          </button>
        </div>

        {tab === "overview" && <p className="mt-5 text-[15px] leading-relaxed text-ink/75">{descrizione}</p>}

        {tab === "credits" && (
          <div className="mt-5 space-y-5">
            <CreditiCompleti etichetta="Designer" valori={autore} />
            <CreditiCompleti etichetta="Illustratori" valori={illustratori} />
            <CreditiCompleti etichetta="Editore" valori={editore} />
            {!autore?.length && !illustratori?.length && !editore?.length && (
              <p className="text-sm text-ink/60">Nessuna informazione sui credits disponibile.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function RigaCredits({
  etichetta,
  valori,
  onVediTutti,
}: {
  etichetta: string;
  valori: string[];
  onVediTutti: () => void;
}) {
  const visibili = valori.slice(0, MOSTRATI_CREDITS);
  const restanti = valori.length - visibili.length;
  return (
    <p className="text-sm text-ink/60">
      <span className="text-ink/40">{etichetta}: </span>
      {visibili.join(", ")}
      {restanti > 0 && (
        <>
          {" "}
          <button type="button" onClick={onVediTutti} className="font-medium text-felt underline hover:no-underline">
            +{restanti}
          </button>
        </>
      )}
    </p>
  );
}

function VotoMini({ etichetta, valore }: { etichetta: string; valore?: number | null }) {
  return (
    <div className="text-right">
      <p className="text-[11px] uppercase tracking-wide text-ink/40">{etichetta}</p>
      <p className="mt-0.5 inline-flex items-center gap-1 font-display text-lg text-ink">
        <Star size={14} className="text-amber-strong" />
        {valore != null ? valore.toFixed(1) : "—"}
      </p>
    </div>
  );
}

function StatBox({ icona: Icona, etichetta, valore }: { icona: typeof Users; etichetta: string; valore: string }) {
  return (
    <div className="rounded-xl bg-card/70 p-3">
      <p className="inline-flex items-center gap-1.5 text-xs text-ink/50">
        <Icona size={18} /> {etichetta}
      </p>
      <p className="mt-1 font-display text-lg text-ink">{valore}</p>
    </div>
  );
}

function CreditiCompleti({ etichetta, valori }: { etichetta: string; valori?: string[] }) {
  if (!valori || valori.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{etichetta}</p>
      <p className="mt-1 text-sm text-ink/70">{valori.join(", ")}</p>
    </div>
  );
}
