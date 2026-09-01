"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SelettoreMultiplo } from "@/components/SelettoreMultiplo";

export function CampoMultiSelezione({
  name,
  etichetta,
  opzioni,
  valoriIniziali,
}: {
  name: string;
  etichetta: string;
  opzioni: string[];
  valoriIniziali: string[];
}) {
  const [selezionati, setSelezionati] = useState<string[]>(valoriIniziali);

  // Se il gioco ha gia' un valore che non e' (piu') nell'anagrafica termini
  // BGG (es. inserito a mano prima che esistesse questa anagrafica), resta
  // comunque selezionabile/rimuovibile invece di sparire silenziosamente.
  const opzioniComplete = useMemo(
    () => Array.from(new Set([...opzioni, ...valoriIniziali])).sort((a, b) => a.localeCompare(b)),
    [opzioni, valoriIniziali]
  );

  function rimuovi(valore: string) {
    setSelezionati((prec) => prec.filter((v) => v !== valore));
  }

  return (
    <div>
      <input type="hidden" name={name} value={selezionati.join(",")} />
      <SelettoreMultiplo
        etichetta={etichetta}
        opzioni={opzioniComplete}
        selezionati={selezionati}
        onChange={setSelezionati}
      />
      {selezionati.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selezionati.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => rimuovi(v)}
              className="inline-flex items-center gap-1 rounded-full bg-felt/8 px-2 py-0.5 text-xs font-medium text-felt hover:bg-felt/15"
            >
              {v} <X size={11} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
