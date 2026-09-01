"use client";

import { Trash2 } from "lucide-react";
import { eliminaGiocoAction } from "@/lib/actions/games";

export function EliminaGiocoButton({ giocoId, titolo }: { giocoId: string; titolo: string }) {
  return (
    <form
      action={eliminaGiocoAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Eliminare "${titolo}"? Le copie registrate vengono eliminate insieme al gioco. Se proviene da BGG, la prossima sync lo reimporta.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={giocoId} />
      <button
        type="submit"
        aria-label={`Elimina ${titolo}`}
        className="rounded-full p-2 text-ink/40 transition hover:bg-coral-soft hover:text-coral"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
