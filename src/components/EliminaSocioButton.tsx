"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { eliminaSocioAction } from "@/lib/actions/users";
import { btnDanger, btnOutline, inputBase, labelBase } from "@/lib/ui";

export function EliminaSocioButton({ utenteId, nome }: { utenteId: string; nome: string }) {
  const [aperto, setAperto] = useState(false);
  const [conferma, setConferma] = useState("");

  const puoEliminare = conferma.trim() === nome;

  function chiudi() {
    setAperto(false);
    setConferma("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAperto(true)}
        aria-label={`Elimina ${nome}`}
        className="rounded-full p-2 text-coral transition hover:bg-coral-soft"
      >
        <Trash2 size={16} />
      </button>

      {aperto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={chiudi}>
          <div
            className="paper-card max-w-md rounded-2xl p-5"
            role="dialog"
            aria-modal="true"
            aria-label={`Elimina ${nome}`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-lg text-ink">Eliminare {nome}?</p>
            <p className="mt-2 text-sm text-ink/70">
              L&apos;operazione non si può annullare: preferiti, voti e richieste d&apos;acquisto del socio vengono
              eliminati insieme all&apos;account (lo storico prestiti resta invece intatto). Se il socio ha ancora
              copie in prestito o richieste in attesa, l&apos;eliminazione viene rifiutata.
            </p>
            <form action={eliminaSocioAction} className="mt-4">
              <input type="hidden" name="utenteId" value={utenteId} />
              <label className={labelBase} htmlFor={`conferma-${utenteId}`}>
                Scrivi &quot;{nome}&quot; per confermare
              </label>
              <input
                id={`conferma-${utenteId}`}
                value={conferma}
                onChange={(e) => setConferma(e.target.value)}
                className={inputBase}
                autoComplete="off"
              />
              <div className="mt-4 flex items-center justify-between">
                <button type="button" onClick={chiudi} className={btnOutline}>
                  Annulla
                </button>
                <button type="submit" disabled={!puoEliminare} className={btnDanger}>
                  Elimina definitivamente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
