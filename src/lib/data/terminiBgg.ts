import "server-only";
import { store } from "@/lib/mock/store";
import type { TipoTermineBgg } from "@/lib/types";

export async function getTraduzioneTermine(tipo: TipoTermineBgg, nomeInglese: string): Promise<string | null> {
  const trovato = store.terminiBgg.find(
    (t) => t.tipo === tipo && t.nomeInglese.toLowerCase() === nomeInglese.toLowerCase()
  );
  return trovato?.nomeItaliano ?? null;
}

export async function salvaTraduzioneTermine(
  tipo: TipoTermineBgg,
  nomeInglese: string,
  nomeItaliano: string
): Promise<void> {
  store.terminiBgg.push({ tipo, nomeInglese, nomeItaliano });
}

export async function getTuttiITermini() {
  return [...store.terminiBgg].sort(
    (a, b) => a.tipo.localeCompare(b.tipo) || a.nomeInglese.localeCompare(b.nomeInglese)
  );
}

// Corregge la traduzione in anagrafica e la propaga ai giochi che usano
// gia' il valore vecchio: altrimenti la correzione si vedrebbe solo sui
// prossimi giochi importati, lasciando quelli gia' sincronizzati indietro.
export async function aggiornaTraduzioneTermine(
  tipo: TipoTermineBgg,
  nomeInglese: string,
  nomeItaliano: string
): Promise<void> {
  const termine = store.terminiBgg.find(
    (t) => t.tipo === tipo && t.nomeInglese.toLowerCase() === nomeInglese.toLowerCase()
  );
  if (!termine) return;
  const vecchio = termine.nomeItaliano;
  termine.nomeItaliano = nomeItaliano;
  if (vecchio === nomeItaliano) return;

  const campo = tipo === "categoria" ? "categorie" : "meccaniche";
  for (const gioco of store.giochi) {
    const valori = gioco[campo];
    if (valori?.includes(vecchio)) {
      gioco[campo] = valori.map((v) => (v === vecchio ? nomeItaliano : v));
    }
  }
}
