import "server-only";
import { store, prossimoIdCopia } from "@/lib/mock/store";
import type { Copia, StatoCopia } from "@/lib/types";

export async function getCopieByGioco(giocoId: string): Promise<Copia[]> {
  return store.copie.filter((c) => c.giocoId === giocoId);
}

export async function getCopiaByCodice(codice: string): Promise<Copia | null> {
  return store.copie.find((c) => c.codice.toLowerCase() === codice.toLowerCase()) ?? null;
}

export async function getCopiaById(id: string): Promise<Copia | null> {
  return store.copie.find((c) => c.id === id) ?? null;
}

export async function getTutteLeCopie(): Promise<Copia[]> {
  return store.copie;
}

function prossimoNumeroPerPrefisso(prefisso: string): number {
  const esistenti = store.copie.filter((c) => c.codice.startsWith(`${prefisso}-`));
  return esistenti.length + 1;
}

export async function creaCopia(giocoId: string, prefissoCodice: string): Promise<Copia> {
  const numero = prossimoNumeroPerPrefisso(prefissoCodice);
  const copia: Copia = {
    id: prossimoIdCopia(),
    giocoId,
    codice: `${prefissoCodice}-${String(numero).padStart(2, "0")}`,
    stato: "disponibile",
    noteAdmin: null,
    dataAcquisizione: new Date().toISOString().slice(0, 10),
  };
  store.copie.push(copia);
  return copia;
}

export async function impostaStatoCopia(
  id: string,
  stato: StatoCopia,
  extra?: { motivoOffline?: string | null }
): Promise<Copia | null> {
  const copia = store.copie.find((c) => c.id === id);
  if (!copia) return null;
  copia.stato = stato;
  if (stato !== "offline") {
    copia.motivoOffline = null;
  } else if (extra?.motivoOffline !== undefined) {
    copia.motivoOffline = extra.motivoOffline;
  }
  return copia;
}

export async function aggiornaNoteAdmin(id: string, noteAdmin: string): Promise<Copia | null> {
  const copia = store.copie.find((c) => c.id === id);
  if (!copia) return null;
  copia.noteAdmin = noteAdmin;
  return copia;
}
