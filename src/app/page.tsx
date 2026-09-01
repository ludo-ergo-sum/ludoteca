import Link from "next/link";
import { ClipboardList, QrCode, Stamp } from "lucide-react";
import { getGiochi } from "@/lib/data/games";
import { auth } from "@/auth";
import { GameBoxCard } from "@/components/GameBoxCard";
import { btnAmber, btnOutline } from "@/lib/ui";

const passi = [
  {
    numero: "01",
    titolo: "Scegli la copia",
    testo: "Sfoglia il catalogo e guarda quali copie di un gioco sono disponibili in questo momento.",
    icona: ClipboardList,
  },
  {
    numero: "02",
    titolo: "Prenota, la segreteria approva",
    testo: "Da socio in regola con la quota, richiedi il prestito: un amministratore la conferma.",
    icona: Stamp,
  },
  {
    numero: "03",
    titolo: "Ritira e restituisci con il QR",
    testo: "Ogni copia ha un QR code proprio: basta scansionarlo in sede per registrare ritiro e rientro.",
    icona: QrCode,
  },
];

export default async function Home() {
  const [giochi, session] = await Promise.all([getGiochi(), auth()]);
  const copieDisponibili = giochi.reduce((tot, g) => tot + g.copieDisponibili, 0);
  const copieTotali = giochi.reduce((tot, g) => tot + g.copieTotali, 0);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="font-mono-tag text-xs font-medium uppercase tracking-widest text-felt">
              Associazione Ludo Ergo Sum · Imperia
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
              La ludoteca dove i giochi da tavolo si prendono in prestito,
              <span className="text-felt"> non si comprano.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink/70">
              Un catalogo condiviso di giochi da tavolo, gestito dai soci per i soci. Guarda cosa c&apos;e&apos;
              sullo scaffale, prenota una copia e vieni a ritirarla in via Foce 40.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#catalogo" className={btnAmber}>
                Sfoglia il catalogo
              </a>
              {!session?.user && (
                <Link href="/login" className={btnOutline}>
                  Diventa socio
                </Link>
              )}
            </div>
          </div>

          <div className="ticket-notch paper-card mx-auto w-full max-w-sm rounded-2xl p-6">
            <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Lo scaffale oggi</p>
            <dl className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-3">
                <dt className="text-sm text-ink/70">Giochi in catalogo</dt>
                <dd className="font-display text-2xl text-ink">{giochi.length}</dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-3">
                <dt className="text-sm text-ink/70">Copie disponibili ora</dt>
                <dd className="font-display text-2xl text-felt">{copieDisponibili}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-sm text-ink/70">Copie totali in ludoteca</dt>
                <dd className="font-display text-2xl text-ink">{copieTotali}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper-soft py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-ink">Come funziona il prestito</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {passi.map(({ numero, titolo, testo, icona: Icona }) => (
              <div key={numero} className="rounded-2xl border border-ink/10 bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono-tag text-xs text-ink/40">{numero}</span>
                  <Icona size={18} className="text-felt" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{titolo}</h3>
                <p className="mt-1.5 text-sm text-ink/70">{testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Il catalogo</h2>
          <span className="text-sm text-ink/50">{giochi.length} giochi</span>
        </div>
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {giochi.map((gioco) => (
            <GameBoxCard key={gioco.id} gioco={gioco} />
          ))}
        </div>
      </section>
    </div>
  );
}
