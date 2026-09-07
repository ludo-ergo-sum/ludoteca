"use client";

import { useMemo, useState } from "react";
import type { Utente } from "@/lib/types";
import { BadgeSocioInRegola } from "@/components/StatusBadge";
import { EliminaSocioButton } from "@/components/EliminaSocioButton";
import { BottoneInvio } from "@/components/BottoneInvio";
import { impostaQuotaAction, impostaRuoloAction } from "@/lib/actions/users";
import { btnOutline, btnPrimary, inputBase, labelBase } from "@/lib/ui";

type Filtro = "tutti" | "da_rinnovare" | "in_regola";

export function ListaSocieQuote({ socie, annoCorrente }: { socie: Utente[]; annoCorrente: number }) {
  const [filtro, setFiltro] = useState<Filtro>("tutti");

  const socieFiltrate = useMemo(() => {
    if (filtro === "tutti") return socie;
    return socie.filter((socio) => {
      const inRegola = socio.quote.find((q) => q.anno === annoCorrente)?.inRegola ?? false;
      return filtro === "in_regola" ? inRegola : !inRegola;
    });
  }, [socie, annoCorrente, filtro]);

  return (
    <div>
      <div className="mt-3 flex gap-1.5">
        {(
          [
            ["tutti", "Tutte"],
            ["da_rinnovare", "Da rinnovare"],
            ["in_regola", "In regola"],
          ] as [Filtro, string][]
        ).map(([valore, etichetta]) => (
          <button
            key={valore}
            type="button"
            onClick={() => setFiltro(valore)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filtro === valore
                ? "border-felt bg-felt/8 text-felt"
                : "border-ink/20 text-ink/70 hover:border-felt hover:text-felt"
            }`}
          >
            {etichetta}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-5">
        {socieFiltrate.map((socio) => {
          const quotaCorrente = socio.quote.find((q) => q.anno === annoCorrente);
          const storico = [...socio.quote].sort((a, b) => b.anno - a.anno);

          return (
            <div key={socio.id} className="paper-card rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink">{socio.nome}</p>
                  <p className="text-xs text-ink/50">{socio.email} · socio dal {socio.dataIscrizione}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeSocioInRegola inRegola={quotaCorrente?.inRegola ?? false} />
                  <form action={impostaRuoloAction}>
                    <input type="hidden" name="utenteId" value={socio.id} />
                    <input type="hidden" name="ruolo" value="admin" />
                    <BottoneInvio className={`${btnOutline} px-3.5 py-1.5 text-xs`}>Promuovi ad admin</BottoneInvio>
                  </form>
                  <EliminaSocioButton utenteId={socio.id} nome={socio.nome} />
                </div>
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
                <BottoneInvio className={`${btnPrimary} px-4 py-2 text-xs`}>Registra</BottoneInvio>
              </form>
            </div>
          );
        })}

        {socieFiltrate.length === 0 && (
          <p className="text-sm text-ink/60">Nessuna socia corrisponde al filtro selezionato.</p>
        )}
      </div>
    </div>
  );
}
