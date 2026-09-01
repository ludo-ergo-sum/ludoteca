import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getGiocoById } from "@/lib/data/games";
import { getCopieByGioco } from "@/lib/data/copies";
import { getPrestitoAttivoPerCopia } from "@/lib/data/loans";
import { getUtenteById } from "@/lib/data/users";
import { generaQrCodeSvg, urlSchedaCopia } from "@/lib/qrcode";
import type { Copia } from "@/lib/types";
import { BadgeStatoCopia } from "@/components/StatusBadge";
import { creaCopiaAction, mettiOfflineAction, rimettiOnlineAction, aggiornaNoteAdminAction } from "@/lib/actions/copies";
import { registraRientroAction } from "@/lib/actions/loans";
import { btnAmber, btnDanger, btnOutline, btnPrimary, inputBase, labelBase } from "@/lib/ui";

export default async function AdminGiocoPage({ params }: PageProps<"/admin/giochi/[id]">) {
  const { id } = await params;
  const gioco = await getGiocoById(id);
  if (!gioco) notFound();

  const copie = await getCopieByGioco(gioco.id);
  const prefissoSuggerito = gioco.titolo.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/giochi" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
        <ArrowLeft size={15} /> Giochi
      </Link>

      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{gioco.titolo}</h1>
      <p className="text-sm text-ink/60">{copie.length} copie registrate</p>

      <div className="mt-7 space-y-5">
        {copie.map((copia) => (
          <CopiaAdminCard key={copia.id} copia={copia} />
        ))}
      </div>

      <form action={creaCopiaAction} className="paper-card mt-8 flex flex-wrap items-end gap-3 rounded-2xl p-5">
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
  );
}

async function CopiaAdminCard({ copia }: { copia: Copia }) {
  const prestitoAttivo = await getPrestitoAttivoPerCopia(copia.id);
  const titolare = prestitoAttivo ? await getUtenteById(prestitoAttivo.utenteId) : null;
  const qrSvg = await generaQrCodeSvg(copia.codice);

  return (
    <div className="paper-card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 flex-none [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div>
            <p className="font-mono-tag text-lg font-semibold text-ink">{copia.codice}</p>
            <p className="text-xs text-ink/50">{urlSchedaCopia(copia.codice)}</p>
            <div className="mt-1.5">
              <BadgeStatoCopia stato={copia.stato} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {copia.stato === "disponibile" && (
            <form action={mettiOfflineAction} className="flex items-end gap-2">
              <input type="hidden" name="copiaId" value={copia.id} />
              <input name="motivoOffline" placeholder="Motivo (opzionale)" className={`${inputBase} w-48`} />
              <button type="submit" className={`${btnDanger} px-3.5 py-2 text-xs`}>
                Fuori linea
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
            <form action={registraRientroAction} className="text-right">
              <input type="hidden" name="prestitoId" value={prestitoAttivo.id} />
              <p className="mb-1.5 text-xs text-ink/60">a {titolare?.nome ?? "socio"}</p>
              <button type="submit" className={`${btnPrimary} px-3.5 py-2 text-xs`}>
                Registra rientro
              </button>
            </form>
          )}
        </div>
      </div>

      {copia.stato === "offline" && copia.motivoOffline && (
        <p className="mt-3 rounded-lg bg-coral-soft px-3 py-2 text-xs text-coral">{copia.motivoOffline}</p>
      )}

      <form action={aggiornaNoteAdminAction} className="mt-4 flex items-end gap-2 border-t border-ink/10 pt-4">
        <input type="hidden" name="copiaId" value={copia.id} />
        <div className="flex-1">
          <label className={labelBase} htmlFor={`note-${copia.id}`}>Nota amministratore (privata)</label>
          <input id={`note-${copia.id}`} name="noteAdmin" defaultValue={copia.noteAdmin ?? ""} className={inputBase} />
        </div>
        <button type="submit" className={`${btnOutline} px-3.5 py-2 text-xs`}>
          Salva
        </button>
      </form>
    </div>
  );
}
