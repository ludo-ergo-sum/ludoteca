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
