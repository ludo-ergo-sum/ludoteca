"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";
import { aggiornaNoteAdminAction, rimuoviNoteAdminAction } from "@/lib/actions/copies";
import { btnDanger, btnOutline, inputBase, labelBase } from "@/lib/ui";

export function NotaCopia({ copiaId, nota }: { copiaId: string; nota: string | null | undefined }) {
  const [aperto, setAperto] = useState(false);

  return (
    <>
      {nota ? (
        <button
          type="button"
          onClick={() => setAperto(true)}
          aria-label="Vedi la nota amministrativa"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-amber text-ink"
        >
          <StickyNote size={15} />
        </button>
      ) : (
        <button type="button" onClick={() => setAperto(true)} className={`${btnOutline} px-3.5 py-2 text-xs`}>
          Nota
        </button>
      )}

      {aperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setAperto(false)}
        >
          <div
            className="paper-card w-full max-w-sm rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Nota amministrativa"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-ink">Nota amministratore</h3>
            <p className="text-xs text-ink/50">Visibile solo allo staff.</p>

            <form action={aggiornaNoteAdminAction} className="mt-3">
              <input type="hidden" name="copiaId" value={copiaId} />
              <label className={labelBase} htmlFor={`nota-${copiaId}`}>
                Testo della nota
              </label>
              <textarea
                id={`nota-${copiaId}`}
                name="noteAdmin"
                defaultValue={nota ?? ""}
                rows={4}
                className={inputBase}
                autoFocus
              />
              <div className="mt-4 flex items-center justify-between gap-2">
                {nota ? (
                  <button
                    type="submit"
                    formAction={rimuoviNoteAdminAction}
                    onClick={() => setAperto(false)}
                    className={`${btnDanger} px-3.5 py-1.5 text-xs`}
                  >
                    Elimina
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAperto(false)}
                    className="px-3.5 py-1.5 text-xs text-ink/50 hover:text-felt"
                  >
                    Annulla
                  </button>
                  <button type="submit" onClick={() => setAperto(false)} className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
                    Salva
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
