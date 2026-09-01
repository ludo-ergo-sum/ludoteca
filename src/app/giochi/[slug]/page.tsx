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
import { formattaIntervallo } from "@/lib/format";

const MOSTRATI = 2;

function tronca(valori: string[]): { visibili: string[]; restanti: number } {
  return { visibili: valori.slice(0, MOSTRATI), restanti: Math.max(0, valori.length - MOSTRATI) };
}

// Elenchi come autore/editore/illustratori possono avere molti valori (BGG
// elenca ogni editore regionale): si mostrano solo i primi 2, il resto e' un
// link che scorre alla sezione "Dettagli completi" in fondo alla pagina.
function ListaConLink({ valori, ancora }: { valori: string[]; ancora: string }) {
  const { visibili, restanti } = tronca(valori);
  return (
    <>
      {visibili.join(", ")}
      {restanti > 0 && (
        <>
          {" "}e <a href={`#${ancora}`} className="underline hover:text-felt">altri {restanti}</a>
        </>
      )}
    </>
  );
}

function ChipConLink({ valori, ancora, className }: { valori: string[]; ancora: string; className: string }) {
  const { visibili, restanti } = tronca(valori);
  return (
    <>
      {visibili.map((v) => (
        <span key={v} className={className}>
          {v}
        </span>
      ))}
      {restanti > 0 && (
        <a href={`#${ancora}`} className={`${className} hover:underline`}>
          +{restanti}
        </a>
      )}
    </>
  );
}

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

  const sezioniComplete = [
    { id: "dettagli-categorie", etichetta: "Categorie", valori: gioco.categorie },
    { id: "dettagli-meccaniche", etichetta: "Meccaniche", valori: gioco.meccaniche ?? [] },
    { id: "dettagli-autore", etichetta: "Autori", valori: gioco.autore ?? [] },
    { id: "dettagli-editore", etichetta: "Editori", valori: gioco.editore ?? [] },
    { id: "dettagli-illustratori", etichetta: "Illustratori", valori: gioco.illustratori ?? [] },
  ].filter((s) => s.valori.length > MOSTRATI);

  const esaurito = gioco.copieDisponibili === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
        <ArrowLeft size={15} /> Catalogo
      </Link>

      <div className="mt-5 flex flex-wrap gap-1.5">
        <ChipConLink
          valori={gioco.categorie}
          ancora="dettagli-categorie"
          className="rounded-full bg-felt/8 px-2.5 py-1 text-xs font-medium text-felt"
        />
        {gioco.meccaniche && (
          <ChipConLink
            valori={gioco.meccaniche}
            ancora="dettagli-meccaniche"
            className="rounded-full border border-ink/15 px-2.5 py-1 text-xs font-medium text-ink/60"
          />
        )}
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{gioco.titolo}</h1>

      {/* Disponibilita' in cima, come un timbro sul biglietto: niente box invadente,
          solo un rigo tra due linee tratteggiate — coerente con lo stile "scontrino". */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-dashed border-ink/15 py-3">
        <p className="inline-flex items-center gap-2 text-sm text-ink/70">
          <span className={`h-2 w-2 rounded-full ${esaurito ? "bg-coral" : "bg-felt"}`} aria-hidden />
          <span className="font-display text-base text-ink">{esaurito ? "Non disponibile" : "Prenotabile"}</span>
        </p>

        {!utente && (
          <Link href={`/login?callbackUrl=/giochi/${gioco.slug}`} className={btnOutline}>
            Accedi per prenotare
          </Link>
        )}

        {utente && richiestaAttiva && (
          <p className="rounded-full bg-amber/10 px-3.5 py-1.5 text-xs font-medium text-amber-strong">
            Hai già una richiesta:{" "}
            <Link href="/profilo" className="underline">
              vedi il tuo profilo
            </Link>
          </p>
        )}

        {utente && !richiestaAttiva && !inRegola && (
          <p className="rounded-full bg-coral-soft px-3.5 py-1.5 text-xs font-medium text-coral">
            Quota non in regola: contatta la segreteria
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
          <p className="text-sm text-ink/50">Nessuna copia libera in questo momento.</p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div>
          <div
            className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl"
            style={{ backgroundColor: copertina.bg }}
          >
            {gioco.immagine ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL esterna (BGG), niente next/image config per un solo campo remoto
              <img src={gioco.immagine} alt={gioco.titolo} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-8xl font-bold opacity-90" style={{ color: copertina.fg }}>
                {gioco.titolo.charAt(0)}
              </span>
            )}
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-ink/75">{gioco.descrizione}</p>

          {(gioco.autore || gioco.editore || gioco.anno) && (
            <p className="mt-6 text-sm text-ink/50">
              {gioco.autore && <ListaConLink valori={gioco.autore} ancora="dettagli-autore" />}
              {gioco.autore && (gioco.editore || gioco.anno) && " · "}
              {gioco.editore && <ListaConLink valori={gioco.editore} ancora="dettagli-editore" />}
              {gioco.editore && gioco.anno && " · "}
              {gioco.anno}
            </p>
          )}
          {gioco.illustratori && (
            <p className="mt-1 text-xs text-ink/40">
              Illustrazioni: <ListaConLink valori={gioco.illustratori} ancora="dettagli-illustratori" />
            </p>
          )}
        </div>

        <div className="space-y-5">
          <div className="ticket-notch paper-card rounded-2xl p-6">
            <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Scheda del gioco</p>
            <dl className="mt-4 space-y-3">
              <Proprieta icona={Users} etichetta="Giocatori" valore={formattaIntervallo(gioco.giocatoriMin, gioco.giocatoriMax)} />
              <Proprieta
                icona={Clock}
                etichetta="Durata"
                valore={`${formattaIntervallo(gioco.durataMinutiMin, gioco.durataMinutiMax)} min`}
              />
              <Proprieta icona={Baby} etichetta="Età minima" valore={`${gioco.etaMinima}+`} />
              <Proprieta
                ultima
                icona={Sparkles}
                etichetta="Difficoltà"
                valore={"●".repeat(gioco.difficolta) + "○".repeat(5 - gioco.difficolta)}
              />
            </dl>
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

      {sezioniComplete.length > 0 && (
        <section className="mt-10 border-t border-ink/10 pt-6">
          <h2 className="font-display text-lg font-semibold text-ink">Dettagli completi</h2>
          <dl className="mt-4 space-y-3">
            {sezioniComplete.map((s) => (
              <div key={s.id} id={s.id}>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink/40">{s.etichetta}</dt>
                <dd className="mt-1 text-sm text-ink/70">{s.valori.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function Proprieta({
  icona: Icona,
  etichetta,
  valore,
  ultima,
}: {
  icona: typeof Users;
  etichetta: string;
  valore: string;
  ultima?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        ultima ? "" : "border-b border-dashed border-ink/15 pb-3"
      }`}
    >
      <dt className="inline-flex items-center gap-1.5 text-sm text-ink/60">
        <Icona size={15} /> {etichetta}
      </dt>
      <dd className="font-display text-lg text-ink">{valore}</dd>
    </div>
  );
}
