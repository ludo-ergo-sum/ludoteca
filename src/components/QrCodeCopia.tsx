"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";

export function QrCodeCopia({ codice, qrSvg }: { codice: string; qrSvg: string }) {
  const [aperto, setAperto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAperto(true)}
        aria-label={`Mostra il QR code della copia ${codice}`}
        className="text-ink/40 transition hover:text-felt"
      >
        <QrCode size={16} />
      </button>

      {aperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setAperto(false)}
        >
          <div
            className="paper-card rounded-2xl p-6 text-center"
            role="dialog"
            aria-modal="true"
            aria-label={`QR code della copia ${codice}`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono-tag text-sm text-ink/60">{codice}</p>
            <div
              className="mx-auto mt-3 h-48 w-48 [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="mt-3 max-w-[14rem] text-xs text-ink/50">
              Scansiona per aprire questa copia dal telefono e prenotarla o gestirla.
            </p>
            <button
              type="button"
              onClick={() => setAperto(false)}
              className="mt-4 text-xs text-ink/50 hover:text-felt hover:underline"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
