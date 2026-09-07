"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { aggiornaTraduzioneTermineAction } from "@/lib/actions/terminiBgg";
import { inputBase, labelBase } from "@/lib/ui";
import type { TerminBgg } from "@/lib/types";

// Il bottone Salva riflette due cose distinte: se ci sono modifiche non
// salvate (confronto con l'ultimo valore inviato con successo) e se il
// salvataggio e' in corso (useFormStatus, disponibile solo in un discendente
// del form). Dopo il submit il valore "di riferimento" si aggiorna subito:
// l'azione non fallisce mai in pratica (nessuna validazione che possa
// rifiutare l'input), quindi non serve attendere una conferma dal server.
export function FormTraduzioneTermine({ termine }: { termine: TerminBgg }) {
  const [nomeItaliano, setNomeItaliano] = useState(termine.nomeItaliano);
  const [descrizione, setDescrizione] = useState(termine.descrizione ?? "");
  const [salvato, setSalvato] = useState({ nomeItaliano: termine.nomeItaliano, descrizione: termine.descrizione ?? "" });

  const modificato = nomeItaliano !== salvato.nomeItaliano || descrizione !== salvato.descrizione;

  return (
    <form
      action={aggiornaTraduzioneTermineAction}
      onSubmit={() => setSalvato({ nomeItaliano, descrizione })}
      className="rounded-xl border border-ink/10 bg-card p-3"
    >
      <input type="hidden" name="tipo" value={termine.tipo} />
      <input type="hidden" name="nomeInglese" value={termine.nomeInglese} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-full flex-none truncate text-xs text-ink/50 sm:w-44" title={termine.nomeInglese}>
          {termine.nomeInglese}
        </span>
        <input
          name="nomeItaliano"
          value={nomeItaliano}
          onChange={(e) => setNomeItaliano(e.target.value)}
          className={`${inputBase} flex-1`}
        />
        <PulsanteSalva modificato={modificato} />
      </div>
      <div className="mt-2 sm:pl-[188px]">
        <label className={`${labelBase} sr-only`} htmlFor={`descrizione-${termine.tipo}-${termine.nomeInglese}`}>
          Descrizione
        </label>
        <textarea
          id={`descrizione-${termine.tipo}-${termine.nomeInglese}`}
          name="descrizione"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Breve descrizione (opzionale, mostrata al hover/click)"
          rows={1}
          maxLength={300}
          className={`${inputBase} w-full resize-y text-xs`}
        />
      </div>
    </form>
  );
}

function PulsanteSalva({ modificato }: { modificato: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!modificato || pending}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-felt hover:text-felt disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending && <Loader2 size={13} className="animate-spin" />}
      Salva
    </button>
  );
}
