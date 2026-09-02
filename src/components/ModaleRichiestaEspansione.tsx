"use client";

import { useState } from "react";
import Link from "next/link";
import { creaRichiestaAcquistoAction } from "@/lib/actions/richiesteAcquisto";
import { btnAmber, btnOutline, inputBase } from "@/lib/ui";

export function ModaleRichiestaEspansione({
  bggId,
  titolo,
  giocoBaseId,
  loggato,
}: {
  bggId: number;
  titolo: string;
  giocoBaseId: string;
  loggato: boolean;
}) {
  const [aperto, setAperto] = useState(false);
  const [inviata, setInviata] = useState(false);

  async function invia(formData: FormData) {
    await creaRichiestaAcquistoAction(formData);
    setInviata(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAperto(true)}
        className="text-sm text-ink/70 underline hover:text-felt"
      >
        {titolo}
      </button>

      {aperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setAperto(false)}
        >
          <div
            className="paper-card max-w-md rounded-2xl p-5"
            role="dialog"
            aria-modal="true"
            aria-label={`Richiedi l'acquisto di ${titolo}`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-lg text-ink">{titolo}</p>

            {!loggato && (
              <>
                <p className="mt-3 text-sm text-ink/70">
                  Non abbiamo ancora questo gioco in ludoteca. Accedi per segnalarlo alla segreteria.
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" onClick={() => setAperto(false)} className={btnOutline}>
                    Annulla
                  </button>
                  <Link href="/login" className={btnAmber}>
                    Accedi per suggerirlo
                  </Link>
                </div>
              </>
            )}

            {loggato && !inviata && (
              <form action={invia} className="mt-3">
                <p className="text-sm text-ink/70">
                  Mi spiace, non abbiamo questo gioco, ma se vuoi suggerirlo usa questo campo e vedremo cosa possiamo
                  fare.
                </p>
                <input type="hidden" name="bggId" value={bggId} />
                <input type="hidden" name="titolo" value={titolo} />
                <input type="hidden" name="giocoBaseId" value={giocoBaseId} />
                <textarea
                  name="messaggio"
                  placeholder="Messaggio (opzionale)"
                  rows={3}
                  maxLength={500}
                  className={`${inputBase} mt-3`}
                />
                <div className="mt-3 flex items-center justify-between">
                  <button type="button" onClick={() => setAperto(false)} className={btnOutline}>
                    Annulla
                  </button>
                  <button type="submit" className={btnAmber}>
                    Invia richiesta
                  </button>
                </div>
              </form>
            )}

            {loggato && inviata && (
              <>
                <p className="mt-3 text-sm text-ink/70">
                  Grazie della segnalazione! La segreteria la valuterà appena possibile.
                </p>
                <button
                  type="button"
                  onClick={() => setAperto(false)}
                  className="mt-4 text-xs text-ink/50 hover:text-felt hover:underline"
                >
                  Chiudi
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
