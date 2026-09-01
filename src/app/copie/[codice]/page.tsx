import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { getCopiaByCodice } from "@/lib/data/copies";
import { getGiocoById } from "@/lib/data/games";
import { getPrestitoAttivoPerCopia } from "@/lib/data/loans";
import { getUtenteById, socioInRegolaPerAnno } from "@/lib/data/users";
import { getUtenteCorrente } from "@/lib/session";
import { copertinaPerGioco } from "@/lib/palette";
import { BadgeStatoCopia } from "@/components/StatusBadge";
import { richiediPrestitoAction, registraRientroAction } from "@/lib/actions/loans";
import { mettiOfflineAction, rimettiOnlineAction, aggiornaNoteAdminAction } from "@/lib/actions/copies";
import { btnAmber, btnDanger, btnOutline, btnPrimary, inputBase, labelBase } from "@/lib/ui";

export default async function CopiaPage({ params }: PageProps<"/copie/[codice]">) {
  const { codice } = await params;
  const copia = await getCopiaByCodice(codice);
  if (!copia) notFound();

  const [gioco, prestitoAttivo, utente] = await Promise.all([
    getGiocoById(copia.giocoId),
    getPrestitoAttivoPerCopia(copia.id),
    getUtenteCorrente(),
  ]);
  if (!gioco) notFound();

  const copertina = copertinaPerGioco(gioco.id);
  const annoCorrente = new Date().getFullYear();
  const inRegola = utente ? socioInRegolaPerAnno(utente, annoCorrente) : false;
  const isAdmin = utente?.ruolo === "admin";
  const titolareAttuale = prestitoAttivo && isAdmin ? await getUtenteById(prestitoAttivo.utenteId) : null;
  const questoPrestitoEDelSocio = utente && prestitoAttivo?.utenteId === utente.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href={`/giochi/${gioco.slug}`} className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
        <ArrowLeft size={15} /> {gioco.titolo}
      </Link>

      <div className="mt-5 flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-none items-center justify-center rounded-xl"
          style={{ backgroundColor: copertina.bg }}
        >
          <span className="font-display text-2xl font-bold" style={{ color: copertina.fg }}>
            {gioco.titolo.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-mono-tag text-xs text-ink/50">Copia</p>
          <h1 className="font-mono-tag text-2xl font-semibold text-ink">{copia.codice}</h1>
          <p className="text-sm text-ink/60">{gioco.titolo}</p>
        </div>
        <div className="ml-auto">
          <BadgeStatoCopia stato={copia.stato} />
        </div>
      </div>

      <div className="paper-card mt-6 rounded-2xl p-6">
        {!utente && (
          <div>
            <p className="text-sm text-ink/70">Accedi con il tuo account socio per richiedere questa copia in prestito.</p>
            <Link href={`/login?callbackUrl=/copie/${copia.codice}`} className={`${btnOutline} mt-4`}>
              Accedi per continuare
            </Link>
          </div>
        )}

        {utente && !isAdmin && copia.stato === "disponibile" && (
          <div>
            {inRegola ? (
              <form action={richiediPrestitoAction}>
                <input type="hidden" name="copiaId" value={copia.id} />
                <p className="text-sm text-ink/70">Questa copia è libera in questo momento.</p>
                <button type="submit" className={`${btnAmber} mt-4`}>
                  Richiedi questa copia in prestito
                </button>
              </form>
            ) : (
              <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm text-coral">
                La tua quota associativa non risulta in regola: contatta la segreteria prima di prenotare.
              </p>
            )}
          </div>
        )}

        {utente && !isAdmin && copia.stato === "in_prestito" && (
          <p className="text-sm text-ink/70">
            {questoPrestitoEDelSocio
              ? "Hai tu questa copia in prestito. Per la restituzione, presentala in sede: sarà un amministratore a registrarla."
              : "Questa copia è attualmente in prestito a un altro socio."}
          </p>
        )}

        {utente && !isAdmin && copia.stato === "offline" && (
          <p className="text-sm text-ink/70">
            Questa copia è momentaneamente fuori linea{copia.motivoOffline ? `: ${copia.motivoOffline}` : "."}
          </p>
        )}

        {isAdmin && (
          <div className="space-y-5">
            {copia.stato === "disponibile" && (
              <form action={mettiOfflineAction} className="space-y-2">
                <input type="hidden" name="copiaId" value={copia.id} />
                <label className={labelBase} htmlFor="motivoOffline">
                  Segna fuori linea (danno, manutenzione, altro)
                </label>
                <textarea id="motivoOffline" name="motivoOffline" rows={2} className={inputBase} placeholder="Motivo..." />
                <button type="submit" className={btnDanger}>
                  Segna fuori linea
                </button>
              </form>
            )}

            {copia.stato === "in_prestito" && prestitoAttivo && (
              <div className="rounded-xl bg-felt/8 p-4">
                <p className="inline-flex items-center gap-1.5 text-sm text-ink/70">
                  <CalendarClock size={14} /> In prestito a <strong>{titolareAttuale?.nome ?? "socio"}</strong> dal{" "}
                  {prestitoAttivo.dataApprovazione ?? prestitoAttivo.dataRichiesta}
                </p>
                <form action={registraRientroAction} className="mt-3">
                  <input type="hidden" name="prestitoId" value={prestitoAttivo.id} />
                  <button type="submit" className={btnPrimary}>
                    Registra il rientro
                  </button>
                </form>
              </div>
            )}

            {copia.stato === "offline" && (
              <form action={rimettiOnlineAction} className="space-y-2">
                <input type="hidden" name="copiaId" value={copia.id} />
                <p className="text-sm text-ink/70">Motivo registrato: {copia.motivoOffline ?? "—"}</p>
                <button type="submit" className={btnPrimary}>
                  Rimetti online
                </button>
              </form>
            )}

            <form action={aggiornaNoteAdminAction} className="space-y-2 border-t border-ink/10 pt-4">
              <input type="hidden" name="copiaId" value={copia.id} />
              <label className={labelBase} htmlFor="noteAdmin">
                Nota amministratore (visibile solo allo staff)
              </label>
              <textarea
                id="noteAdmin"
                name="noteAdmin"
                rows={2}
                defaultValue={copia.noteAdmin ?? ""}
                className={inputBase}
              />
              <button type="submit" className={btnOutline}>
                Salva nota
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
