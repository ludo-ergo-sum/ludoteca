"use client";

import { useRef } from "react";
import { inputBase } from "@/lib/ui";

// Textarea non controllata: il form legge il valore finale da FormData al
// submit, non serve stato React. I pulsanti sotto inseriscono {{segnaposto}}
// alla posizione del cursore invece che sempre in fondo.
export function CampoTemplateEmail({
  id,
  name,
  defaultValue,
  segnaposto,
  righe = 6,
}: {
  id: string;
  name: string;
  defaultValue: string;
  segnaposto?: string[];
  righe?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function inserisci(token: string) {
    const el = ref.current;
    if (!el) return;
    const inizio = el.selectionStart ?? el.value.length;
    const fine = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, inizio) + token + el.value.slice(fine);
    el.focus();
    el.selectionStart = el.selectionEnd = inizio + token.length;
  }

  return (
    <div>
      <textarea
        ref={ref}
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={righe}
        className={`${inputBase} font-mono-tag text-xs leading-relaxed`}
      />
      {segnaposto && segnaposto.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {segnaposto.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => inserisci(`{{${s}}}`)}
              className="rounded-full border border-ink/15 px-2.5 py-0.5 font-mono-tag text-[11px] text-ink/60 transition hover:border-felt hover:text-felt"
            >
              {`{{${s}}}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
