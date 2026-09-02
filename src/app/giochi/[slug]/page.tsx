import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Heart, ShoppingCart } from "lucide-react";
import { getGiocoByBggId, getGiocoBySlug } from "@/lib/data/games";
import { getCopieByGioco } from "@/lib/data/copies";
import { getPrestitiByUtente } from "@/lib/data/loans";
import { getUtenteCorrente } from "@/lib/session";
import { socioInRegolaPerAnno } from "@/lib/data/users";
import { copertinaPerGioco } from "@/lib/palette";
import { BadgeStatoCopia } from "@/components/StatusBadge";
import { QrCodeCopia } from "@/components/QrCodeCopia";
import { HeroGioco } from "@/components/HeroGioco";
import { ModaleRichiestaEspansione } from "@/components/ModaleRichiestaEspansione";
import { richiediPrestitoAction } from "@/lib/actions/loans";
import { salvaRecensioneAction } from "@/lib/actions/recensioni";
import { toggleFavoritoAction } from "@/lib/actions/preferiti";
import { btnAmber, btnOutline, inputBase, labelBase } from "@/lib/ui";
import { generaQrCodeSvg } from "@/lib/qrcode";
import { getMediaVotiGioco, getRecensioneUtente } from "@/lib/data/recensioni";
import { getRecensioniConAutoreByGioco } from "@/lib/data/enriched";
import { getNumeroPreferitiGioco, isPreferito } from "@/lib/data/preferiti";

export default async function GiocoPage({ params }: PageProps<"/giochi/[slug]">) {
  const { slug } = await params;
  const gioco = await getGiocoBySlug(slug);
  if (!gioco) notFound();

  const [copie, utente, recensioni, mediaVoti, numeroPreferiti] = await Promise.all([
    getCopieByGioco(gioco.id),
    getUtenteCorrente(),
    getRecensioniConAutoreByGioco(gioco.id),
    getMediaVotiGioco(gioco.id),
    getNumeroPreferitiGioco(gioco.id),
  ]);
  const [recensioneUtente, preferito] = utente
    ? await Promise.all([getRecensioneUtente(utente.id, gioco.id), isPreferito(utente.id, gioco.id)])
    : [null, false];
  const espansioniConMatch = await Promise.all(
    (gioco.espansioni ?? []).map(async (espansione) => ({
      ...espansione,
      trovata: await getGiocoByBggId(espansione.bggId),
    }))
  );
  const copertina = copertinaPerGioco(gioco.id);
  const primaDisponibile = copie.find((c) => c.stato === "disponibile");

  const prestitiUtente = utente ? await getPrestitiByUtente(utente.id) : [];
  const richiestaAttiva = prestitiUtente.find(
    (p) => p.giocoId === gioco.id && (p.stato === "in_attesa" || p.stato === "approvato" || p.stato === "in_corso")
  );
  const annoCorrente = new Date().getFullYear();
  const inRegola = utente ? socioInRegolaPerAnno(utente, annoCorrente) : false;

  // La card "Copie in ludoteca" (stato + QR di ogni copia) e' riservata agli
  // admin: le socie prenotano/restituiscono tramite il QR fisico sulla copia
  // o il bottone "Prenota una copia" qui sopra, non serve piu' vederle tutte.
  const isAdmin = utente?.ruolo === "admin";
  const copieConQr = isAdmin
    ? await Promise.all(
        copie.map(async (copia) => {
          const eDelSocioLoggato = prestitiUtente.some(
            (p) => p.copiaId === copia.id && (p.stato === "in_corso" || p.stato === "approvato")
          );
          const mostraQr = copia.stato === "disponibile" || (copia.stato === "in_prestito" && eDelSocioLoggato);
          return { copia, qrSvg: mostraQr ? await generaQrCodeSvg(copia.codice) : null };
        })
      )
    : [];

  const esaurito = gioco.copieDisponibili === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
          <ArrowLeft size={15} /> Catalogo
        </Link>
        {utente && (
          <form action={toggleFavoritoAction}>
            <input type="hidden" name="giocoId" value={gioco.id} />
            <button
              type="submit"
              aria-label={preferito ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
              className="flex-none rounded-full p-2 transition hover:bg-coral-soft"
            >
              <Heart size={18} className={preferito ? "fill-coral text-coral" : "text-ink/30"} />
            </button>
          </form>
        )}
      </div>

      {/* Disponibilita' in cima, come un timbro sul biglietto: niente box invadente,
          solo un rigo tra due linee tratteggiate — coerente con lo stile "scontrino". */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-dashed border-ink/15 py-3">
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
        <HeroGioco
          immagine={gioco.immagine}
          titolo={gioco.titolo}
          copertina={copertina}
          giocatoriMin={gioco.giocatoriMin}
          giocatoriMax={gioco.giocatoriMax}
          durataMinutiMin={gioco.durataMinutiMin}
          durataMinutiMax={gioco.durataMinutiMax}
          etaMinima={gioco.etaMinima}
          anno={gioco.anno}
          difficolta={gioco.difficolta}
          bggValutazioneMedia={gioco.bggValutazioneMedia}
          bggNumeroVoti={gioco.bggNumeroVoti}
          votoLes={mediaVoti?.media}
          votoLesNumero={mediaVoti?.numero}
          numeroPreferiti={numeroPreferiti}
          descrizione={gioco.descrizione}
          autore={gioco.autore}
          editore={gioco.editore}
          illustratori={gioco.illustratori}
        />

        <aside className="space-y-5">
          <div className="paper-card rounded-2xl p-6">
            <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Categorie</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {gioco.categorie.map((c) => (
                <span key={c} className="rounded-full bg-felt/8 px-2.5 py-1 text-xs font-medium text-felt">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {gioco.meccaniche && gioco.meccaniche.length > 0 && (
            <div className="paper-card rounded-2xl p-6">
              <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Meccaniche</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {gioco.meccaniche.map((m) => (
                  <span key={m} className="rounded-full border border-ink/15 px-2.5 py-1 text-xs font-medium text-ink/60">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {espansioniConMatch.length > 0 && (
            <div className="paper-card rounded-2xl p-6">
              <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Espansioni</p>
              <ul className="mt-3 space-y-2">
                {espansioniConMatch.map((espansione) => (
                  <li key={espansione.bggId} className="flex items-center gap-1.5">
                    {espansione.trovata ? (
                      <>
                        <CheckCircle2 size={14} className="flex-none text-felt" aria-label="In ludoteca" />
                        <Link
                          href={`/giochi/${espansione.trovata.slug}`}
                          className="text-sm text-ink/70 underline hover:text-felt"
                        >
                          {espansione.titolo}
                        </Link>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} className="flex-none text-ink/40" aria-label="Non in ludoteca" />
                        <ModaleRichiestaEspansione
                          bggId={espansione.bggId}
                          titolo={espansione.titolo}
                          giocoBaseId={gioco.id}
                          loggato={!!utente}
                        />
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {isAdmin && (
        <div className="paper-card mt-8 rounded-2xl p-6">
          <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Copie in ludoteca</p>
          <ul className="mt-3 space-y-2">
            {copieConQr.map(({ copia, qrSvg }) => (
              <li key={copia.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-mono-tag text-ink/70">{copia.codice}</span>
                <div className="flex items-center gap-2.5">
                  <BadgeStatoCopia stato={copia.stato} />
                  {qrSvg && <QrCodeCopia codice={copia.codice} qrSvg={qrSvg} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section id="recensione" className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="font-display text-lg font-semibold text-ink">Recensioni delle socie e dei soci</h2>

        {utente && (
          <form action={salvaRecensioneAction} className="paper-card mt-4 rounded-2xl p-5">
            <input type="hidden" name="giocoId" value={gioco.id} />
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className={labelBase} htmlFor="voto">
                  Il tuo voto
                </label>
                <select
                  id="voto"
                  name="voto"
                  defaultValue={recensioneUtente?.voto ?? 8}
                  className={`${inputBase} w-20`}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[220px] flex-1">
                <label className={labelBase} htmlFor="commento">
                  Commento (opzionale)
                </label>
                <textarea
                  id="commento"
                  name="commento"
                  defaultValue={recensioneUtente?.commento ?? ""}
                  rows={2}
                  maxLength={500}
                  className={inputBase}
                />
              </div>
              <button type="submit" className={btnAmber}>
                {recensioneUtente ? "Aggiorna voto" : "Vota questo gioco"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 space-y-3">
          {recensioni.length === 0 && <p className="text-sm text-ink/60">Nessuna recensione per ora.</p>}
          {recensioni.map((recensione) => (
            <div key={recensione.id} className="rounded-xl border border-ink/10 bg-card/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">{recensione.autoreNome}</p>
                <p className="font-display text-base text-ink">{recensione.voto}/10</p>
              </div>
              {recensione.commento && <p className="mt-1.5 text-sm text-ink/70">{recensione.commento}</p>}
              <p className="mt-1 text-xs text-ink/40">{recensione.data}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
