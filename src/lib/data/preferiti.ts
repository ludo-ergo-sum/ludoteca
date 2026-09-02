import "server-only";
import { store } from "@/lib/mock/store";
import type { Preferito } from "@/lib/types";

export async function isPreferito(utenteId: string, giocoId: string): Promise<boolean> {
  return store.preferiti.some((p) => p.utenteId === utenteId && p.giocoId === giocoId);
}

export async function getPreferitiByUtente(utenteId: string): Promise<Preferito[]> {
  return store.preferiti.filter((p) => p.utenteId === utenteId);
}

export async function getNumeroPreferitiGioco(giocoId: string): Promise<number> {
  return store.preferiti.filter((p) => p.giocoId === giocoId).length;
}

// Ritorna il nuovo stato (true = appena aggiunto, false = appena rimosso).
export async function toggleFavorito(utenteId: string, giocoId: string): Promise<boolean> {
  const indice = store.preferiti.findIndex((p) => p.utenteId === utenteId && p.giocoId === giocoId);
  if (indice >= 0) {
    store.preferiti.splice(indice, 1);
    return false;
  }
  store.preferiti.push({ utenteId, giocoId, data: new Date().toISOString().slice(0, 10) });
  return true;
}
