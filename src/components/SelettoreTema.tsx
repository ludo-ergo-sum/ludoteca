"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { CHIAVE_STORAGE_TEMA, TEMA_DEFAULT, TEMI } from "@/lib/temi";

export function SelettoreTema() {
  const [tema, setTema] = useState(TEMA_DEFAULT);

  useEffect(() => {
    const salvato = window.localStorage.getItem(CHIAVE_STORAGE_TEMA);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage e' leggibile solo lato client, va sincronizzato dopo il mount
    if (salvato) setTema(salvato);
  }, []);

  function cambiaTema(id: string) {
    setTema(id);
    document.documentElement.dataset.tema = id;
    window.localStorage.setItem(CHIAVE_STORAGE_TEMA, id);
  }

  return (
    <label className="flex items-center gap-1.5 rounded-full border border-card/30 px-2.5 py-1.5 text-card/85">
      <Palette size={14} className="shrink-0" />
      <select
        value={tema}
        onChange={(e) => cambiaTema(e.target.value)}
        aria-label="Tema grafico (in valutazione)"
        className="bg-transparent text-xs font-medium text-card focus:outline-none"
      >
        {TEMI.map((t) => (
          <option key={t.id} value={t.id} className="text-ink">
            {t.nome}
          </option>
        ))}
      </select>
    </label>
  );
}
