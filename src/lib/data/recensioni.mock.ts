import "server-only";
import { store, prossimoIdRecensione } from "@/lib/mock/store";
import type { Recensione } from "@/lib/types";

export async function getRecensioniByGioco(giocoId: string): Promise<Recensione[]> {
  return store.recensioni.filter((r) => r.giocoId === giocoId).sort((a, b) => b.data.localeCompare(a.data));
}

export async function getRecensioneUtente(utenteId: string, giocoId: string): Promise<Recensione | null> {
  return store.recensioni.find((r) => r.utenteId === utenteId && r.giocoId === giocoId) ?? null;
}

export async function getRecensioniByUtente(utenteId: string): Promise<Recensione[]> {
  return store.recensioni.filter((r) => r.utenteId === utenteId);
}

export async function getMediaVotiGioco(giocoId: string): Promise<{ media: number; numero: number } | null> {
  const voci = store.recensioni.filter((r) => r.giocoId === giocoId);
  if (voci.length === 0) return null;
  const media = voci.reduce((somma, r) => somma + r.voto, 0) / voci.length;
  return { media, numero: voci.length };
}

// Un voto per socio per gioco: se esiste gia' una recensione la aggiorna
// invece di crearne una seconda (il socio puo' cambiare idea nel tempo).
export async function salvaRecensione(
  utenteId: string,
  giocoId: string,
  voto: number,
  commento: string | null
): Promise<Recensione> {
  const oggi = new Date().toISOString().slice(0, 10);
  const esistente = store.recensioni.find((r) => r.utenteId === utenteId && r.giocoId === giocoId);
  if (esistente) {
    esistente.voto = voto;
    esistente.commento = commento;
    esistente.data = oggi;
    return esistente;
  }

  const recensione: Recensione = { id: prossimoIdRecensione(), giocoId, utenteId, voto, commento, data: oggi };
  store.recensioni.push(recensione);
  return recensione;
}
