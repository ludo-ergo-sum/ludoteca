import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Baby, Clock, Sparkles, Users } from "lucide-react";
import { getGiocoBySlug } from "@/lib/data/games";
import { getCopieByGioco } from "@/lib/data/copies";
import { getPrestitiByUtente } from "@/lib/data/loans";
import { getUtenteCorrente } from "@/lib/session";
import { socioInRegolaPerAnno } from "@/lib/data/users";
import { copertinaPerGioco } from "@/lib/palette";
import { BadgeStatoCopia } from "@/components/StatusBadge";
import { richiediPrestitoAction } from "@/lib/actions/loans";
import { btnAmber, btnOutline } from "@/lib/ui";

export default async function GiocoPage({ params }: PageProps<"/giochi/[slug]">) {
  const { slug } = await params;
  const gioco = await getGiocoBySlug(slug);
  if (!gioco) notFound();

  const [copie, utente] = await Promise.all([getCopieByGioco(gioco.id), getUtenteCorrente()]);
  const copertina = copertinaPerGioco(gioco.id);
  const primaDisponibile = copie.find((c) => c.stato === "disponibile");

  const prestitiUtente = utente ? await getPrestitiByUtente(utente.id) : [];
  const richiestaAttiva = prestitiUtente.find(
    (p) => p.giocoId === gioco.id && (p.stato === "in_attesa" || p.stato === "approvato" || p.stato === "in_corso")
  );
  const annoCorrente = new Date().getFullYear();
  const inRegola = utente ? socioInRegolaPerAnno(utente, annoCorrente) : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
        <ArrowLeft size={15} /> Catalogo
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div>
          <div
            className="flex h-48 items-center justify-center rounded-2xl"
            style={{ backgroundColor: copertina.bg }}
          >
            <span className="font-display text-8xl font-bold opacity-90" style={{ color: copertina.fg }}>
              {gioco.titolo.charAt(0)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {gioco.categorie.map((categoria) => (
              <span key={categoria} className="rounded-full bg-felt/8 px-2.5 py-1 text-xs font-medium text-felt">
                {categoria}
              </span>
            ))}
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{gioco.titolo}</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/75">{gioco.descrizione}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Proprieta icona={Users} etichetta="Giocatori" valore={`${gioco.giocatoriMin}-${gioco.giocatoriMax}`} />
            <Proprieta icona={Clock} etichetta="Durata" valore={`${gioco.durataMinutiMin}-${gioco.durataMinutiMax} min`} />
            <Proprieta icona={Baby} etichetta="Età minima" valore={`${gioco.etaMinima}+`} />
            <Proprieta icona={Sparkles} etichetta="Difficoltà" valore={"●".repeat(gioco.difficolta) + "○".repeat(5 - gioco.difficolta)} />
          </dl>

          {(gioco.autore || gioco.editore || gioco.anno) && (
            <p className="mt-6 text-sm text-ink/50">
              {[gioco.autore, gioco.editore, gioco.anno].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <div className="space-y-5">
          <div className="paper-card rounded-2xl p-6">
            <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Disponibilità</p>
            <p className="mt-2 font-display text-2xl text-ink">
              {gioco.copieDisponibili} / {gioco.copieTotali} copie libere
            </p>

            <div className="mt-5">
              {!utente && (
                <Link href={`/login?callbackUrl=/giochi/${gioco.slug}`} className={btnOutline}>
                  Accedi per prenotare
                </Link>
              )}

              {utente && richiestaAttiva && (
                <p className="rounded-xl bg-amber/10 px-4 py-3 text-sm text-amber-strong">
                  Hai già una richiesta per questo gioco: consulta{" "}
                  <Link href="/profilo" className="underline">
                    il tuo profilo
                  </Link>
                  .
                </p>
              )}

              {utente && !richiestaAttiva && !inRegola && (
                <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm text-coral">
                  La tua quota associativa non risulta in regola: contatta la segreteria prima di prenotare.
                </p>
              )}

              {utente && !richiestaAttiva && inRegola && primaDisponibile && (
                <form action={richiediPrestitoAction}>
                  <input type="hidden" name="copiaId" value={primaDisponibile.id} />
                  <button type="submit" className={btnAmber}>
                    Prenota una copia
                  </button>
                </form>
              )}

              {utente && !richiestaAttiva && inRegola && !primaDisponibile && (
                <p className="text-sm text-ink/60">Nessuna copia libera in questo momento.</p>
              )}
            </div>
          </div>

          {utente && (
            <div className="paper-card rounded-2xl p-6">
              <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Copie in ludoteca</p>
              <ul className="mt-3 space-y-2">
                {copie.map((copia) => (
                  <li key={copia.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-mono-tag text-ink/70">{copia.codice}</span>
                    <BadgeStatoCopia stato={copia.stato} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Proprieta({
  icona: Icona,
  etichetta,
  valore,
}: {
  icona: typeof Users;
  etichetta: string;
  valore: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink/50">
        <Icona size={13} /> {etichetta}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{valore}</dd>
    </div>
  );
}
