import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { getGiocoById } from "@/lib/data/games";
import { getCopieByGioco } from "@/lib/data/copies";
import { getPrestitoAttivoPerCopia } from "@/lib/data/loans";
import { getUtenteById } from "@/lib/data/users";
import { getTuttiITermini } from "@/lib/data/terminiBgg";
import { generaQrCodeSvg } from "@/lib/qrcode";
import type { Copia } from "@/lib/types";
import { BadgeStatoCopia } from "@/components/StatusBadge";
import { NotaCopia } from "@/components/NotaCopia";
import { CampoMultiSelezione } from "@/components/CampoMultiSelezione";
import { CampoImmagine } from "@/components/CampoImmagine";
import { creaCopiaAction, mettiOfflineAction, rimettiOnlineAction } from "@/lib/actions/copies";
import { registraRientroAction } from "@/lib/actions/loans";
import { aggiornaGiocoAction } from "@/lib/actions/games";
import { btnAmber, btnDanger, btnOutline, btnPrimary, inputBase, labelBase } from "@/lib/ui";

export default async function AdminGiocoPage({ params }: PageProps<"/admin/giochi/[id]">) {
  const { id } = await params;
  const gioco = await getGiocoById(id);
  if (!gioco) notFound();

  const [copie, termini] = await Promise.all([getCopieByGioco(gioco.id), getTuttiITermini()]);
  const categorieDisponibili = termini.filter((t) => t.tipo === "categoria").map((t) => t.nomeItaliano);
  const meccanicheDisponibili = termini.filter((t) => t.tipo === "meccanica").map((t) => t.nomeItaliano);
  const prefissoSuggerito = gioco.titolo.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin/giochi" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
        <ArrowLeft size={15} /> Giochi
      </Link>

      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{gioco.titolo}</h1>
      <p className="text-sm text-ink/60">{copie.length} copie registrate</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
      <div className="paper-card rounded-2xl p-6">
        <p className="font-display text-lg text-ink">Modifica dati del gioco</p>
        <form action={aggiornaGiocoAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={gioco.id} />
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="titolo">Titolo</label>
            <input id="titolo" name="titolo" defaultValue={gioco.titolo} required className={inputBase} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="descrizione">Descrizione</label>
            <textarea
              id="descrizione"
              name="descrizione"
              defaultValue={gioco.descrizione}
              required
              rows={4}
              className={inputBase}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="immagine">URL immagine</label>
            <CampoImmagine id="immagine" name="immagine" defaultValue={gioco.immagine} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="miniatura">URL miniatura</label>
            <CampoImmagine id="miniatura" name="miniatura" defaultValue={gioco.miniatura ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase}>Categorie</label>
            <CampoMultiSelezione
              name="categorie"
              etichetta="Categorie"
              opzioni={categorieDisponibili}
              valoriIniziali={gioco.categorie}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase}>Meccaniche</label>
            <CampoMultiSelezione
              name="meccaniche"
              etichetta="Meccaniche"
              opzioni={meccanicheDisponibili}
              valoriIniziali={gioco.meccaniche ?? []}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="giocatoriMin">Giocatori minimi</label>
            <input
              id="giocatoriMin"
              name="giocatoriMin"
              type="number"
              min={1}
              defaultValue={gioco.giocatoriMin}
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="giocatoriMax">Giocatori massimi</label>
            <input
              id="giocatoriMax"
              name="giocatoriMax"
              type="number"
              min={1}
              defaultValue={gioco.giocatoriMax}
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="durataMinutiMin">Durata minima (min)</label>
            <input
              id="durataMinutiMin"
              name="durataMinutiMin"
              type="number"
              min={5}
              defaultValue={gioco.durataMinutiMin}
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="durataMinutiMax">Durata massima (min)</label>
            <input
              id="durataMinutiMax"
              name="durataMinutiMax"
              type="number"
              min={5}
              defaultValue={gioco.durataMinutiMax}
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="etaMinima">Età minima</label>
            <input
              id="etaMinima"
              name="etaMinima"
              type="number"
              min={0}
              defaultValue={gioco.etaMinima}
              required
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="difficolta">Difficoltà (1-5)</label>
            <input
              id="difficolta"
              name="difficolta"
              type="number"
              min={1}
              max={5}
              defaultValue={gioco.difficolta}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="autore">Autore/i (separati da virgola)</label>
            <input id="autore" name="autore" defaultValue={(gioco.autore ?? []).join(", ")} className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="editore">Editore/i (separati da virgola)</label>
            <input id="editore" name="editore" defaultValue={(gioco.editore ?? []).join(", ")} className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="illustratori">Illustratori (separati da virgola)</label>
            <input
              id="illustratori"
              name="illustratori"
              defaultValue={(gioco.illustratori ?? []).join(", ")}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase} htmlFor="anno">Anno di pubblicazione</label>
            <input id="anno" name="anno" type="number" defaultValue={gioco.anno} className={inputBase} />
          </div>

          {gioco.bggId != null && (
            <div className="rounded-xl bg-felt/8 p-4 sm:col-span-2">
              <p className="text-sm text-ink/70">
                Sincronizzazione BGG:{" "}
                {gioco.bggSyncBloccata ? "bloccata (gioco modificato a mano)" : "attiva"}.
                {gioco.dataImportazioneBgg && ` Importato il ${gioco.dataImportazioneBgg}.`}
              </p>
              <label className="mt-2 flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  name="permettiSyncBgg"
                  className="h-4 w-4 rounded border-ink/30 text-felt focus:ring-felt"
                />
                Permetti alla sync BGG di sovrascrivere questo gioco al prossimo aggiornamento automatico
              </label>
            </div>
          )}

          <div className="sm:col-span-2">
            <button type="submit" className={btnAmber}>
              Salva modifiche
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-5">
        {copie.map((copia) => (
          <CopiaAdminCard key={copia.id} copia={copia} />
        ))}

        <form action={creaCopiaAction} className="paper-card flex flex-wrap items-end gap-3 rounded-2xl p-5">
          <input type="hidden" name="giocoId" value={gioco.id} />
          <div>
            <label className={labelBase} htmlFor="prefisso">Prefisso codice copia</label>
            <input
              id="prefisso"
              name="prefisso"
              defaultValue={prefissoSuggerito}
              maxLength={4}
              required
              className={`${inputBase} w-32 uppercase`}
            />
          </div>
          <button type="submit" className={btnAmber}>
            Registra nuova copia
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

async function CopiaAdminCard({ copia }: { copia: Copia }) {
  const prestitoAttivo = await getPrestitoAttivoPerCopia(copia.id);
  const titolare = prestitoAttivo ? await getUtenteById(prestitoAttivo.utenteId) : null;
  const qrSvg = await generaQrCodeSvg(copia.codice);

  return (
    <div className="paper-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 flex-none [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div>
            <p className="font-mono-tag text-lg font-semibold text-ink">{copia.codice}</p>
            <div className="mt-1.5">
              <BadgeStatoCopia stato={copia.stato} />
            </div>
          </div>
        </div>
        {copia.stato === "in_prestito" && prestitoAttivo && (
          <p className="text-right text-xs text-ink/60">In prestito a {titolare?.nome ?? "socio"}</p>
        )}
      </div>

      {copia.stato === "offline" && copia.motivoOffline && (
        <p className="mt-3 rounded-lg bg-coral-soft px-3 py-2 text-xs text-coral">{copia.motivoOffline}</p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-ink/10 pt-4">
        {copia.stato === "disponibile" && (
          <form action={mettiOfflineAction} className="flex flex-1 flex-wrap items-end gap-2">
            <input type="hidden" name="copiaId" value={copia.id} />
            <input
              name="motivoOffline"
              placeholder="Motivo (opzionale)"
              className={`${inputBase} min-w-[120px] flex-1`}
            />
            <button type="submit" className={`${btnDanger} px-3.5 py-2 text-xs`}>
              Sospendi
            </button>
          </form>
        )}
        {copia.stato === "offline" && (
          <form action={rimettiOnlineAction}>
            <input type="hidden" name="copiaId" value={copia.id} />
            <button type="submit" className={`${btnPrimary} px-3.5 py-2 text-xs`}>
              Rimetti online
            </button>
          </form>
        )}
        {copia.stato === "in_prestito" && prestitoAttivo && (
          <form action={registraRientroAction}>
            <input type="hidden" name="prestitoId" value={prestitoAttivo.id} />
            <button type="submit" className={`${btnPrimary} px-3.5 py-2 text-xs`}>
              Registra rientro
            </button>
          </form>
        )}
        <form action="/api/admin/etichette" method="POST">
          <input type="hidden" name="copiaId" value={copia.id} />
          <button type="submit" className={`${btnOutline} px-3.5 py-2 text-xs`}>
            <Printer size={13} /> Stampa etichetta
          </button>
        </form>
        <NotaCopia copiaId={copia.id} nota={copia.noteAdmin} />
      </div>
    </div>
  );
}
