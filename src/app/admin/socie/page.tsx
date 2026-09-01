import { getSocie } from "@/lib/data/users";
import { BadgeSocioInRegola } from "@/components/StatusBadge";
import { impostaQuotaAction } from "@/lib/actions/users";
import { btnPrimary, inputBase, labelBase } from "@/lib/ui";

export default async function AdminSociePage() {
  const socie = (await getSocie()).filter((u) => u.ruolo === "socio");
  const annoCorrente = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Socie e quote associative</h1>

      <div className="mt-8 space-y-5">
        {socie.map((socio) => {
          const quotaCorrente = socio.quote.find((q) => q.anno === annoCorrente);
          const storico = [...socio.quote].sort((a, b) => b.anno - a.anno);

          return (
            <div key={socio.id} className="paper-card rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink">{socio.nome}</p>
                  <p className="text-xs text-ink/50">{socio.email} · socio dal {socio.dataIscrizione}</p>
                </div>
                <BadgeSocioInRegola inRegola={quotaCorrente?.inRegola ?? false} />
              </div>

              {storico.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-ink/50">
                  {storico.map((q) => (
                    <li key={q.anno} className="rounded-full border border-ink/15 px-2.5 py-1">
                      {q.anno}: {q.inRegola ? "in regola" : "non in regola"}
                    </li>
                  ))}
                </ul>
              )}

              <form action={impostaQuotaAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-ink/10 pt-4">
                <input type="hidden" name="utenteId" value={socio.id} />
                <div>
                  <label className={labelBase} htmlFor={`anno-${socio.id}`}>Anno</label>
                  <input
                    id={`anno-${socio.id}`}
                    name="anno"
                    type="number"
                    defaultValue={annoCorrente}
                    className={`${inputBase} w-24`}
                  />
                </div>
                <div className="flex items-center gap-2 pb-2.5">
                  <input id={`regola-${socio.id}`} name="inRegola" type="checkbox" defaultChecked className="h-4 w-4" />
                  <label htmlFor={`regola-${socio.id}`} className="text-sm text-ink/80">
                    Quota versata / in regola
                  </label>
                </div>
                <div className="flex-1">
                  <label className={labelBase} htmlFor={`note-${socio.id}`}>Nota (opzionale)</label>
                  <input id={`note-${socio.id}`} name="note" className={inputBase} />
                </div>
                <button type="submit" className={`${btnPrimary} px-4 py-2 text-xs`}>
                  Registra
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
