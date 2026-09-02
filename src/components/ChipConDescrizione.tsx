"use client";

import { useState } from "react";

// Se non c'e' descrizione il chip resta un semplice span, senza costo di
// interattivita' client-side per i tanti termini che non ne hanno ancora una.
export function ChipConDescrizione({
  etichetta,
  descrizione,
  className,
}: {
  etichetta: string;
  descrizione?: string;
  className: string;
}) {
  const [aperto, setAperto] = useState(false);

  if (!descrizione) {
    return <span className={className}>{etichetta}</span>;
  }

  return (
    <span className="group/chip relative inline-block">
      <button type="button" onClick={() => setAperto((v) => !v)} className={className}>
        {etichetta}
      </button>
      <span
        role="tooltip"
        className={`absolute left-1/2 top-full z-10 mt-1.5 w-52 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs leading-snug text-card shadow-lg transition ${
          aperto
            ? "visible opacity-100"
            : "invisible opacity-0 group-hover/chip:visible group-hover/chip:opacity-100"
        }`}
      >
        {descrizione}
      </span>
    </span>
  );
}
