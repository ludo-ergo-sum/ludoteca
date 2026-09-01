import "server-only";
import { store, prossimoIdPrestito } from "@/lib/mock/store";
import type { Prestito } from "@/lib/types";

export async function getPrestiti(): Promise<Prestito[]> {
  return store.prestiti;
}

export async function getPrestitiByUtente(utenteId: string): Promise<Prestito[]> {
  return store.prestiti
    .filter((p) => p.utenteId === utenteId)
    .sort((a, b) => b.dataRichiesta.localeCompare(a.dataRichiesta));
}

export async function getPrestitiInAttesa(): Promise<Prestito[]> {
  return store.prestiti.filter((p) => p.stato === "in_attesa");
}

export async function getPrestitoAttivoPerCopia(copiaId: string): Promise<Prestito | null> {
  return (
    store.prestiti.find(
      (p) => p.copiaId === copiaId && (p.stato === "in_corso" || p.stato === "approvato")
    ) ?? null
  );
}

export async function getStoricoByCopia(copiaId: string): Promise<Prestito[]> {
  return store.prestiti
    .filter((p) => p.copiaId === copiaId)
    .sort((a, b) => b.dataRichiesta.localeCompare(a.dataRichiesta));
}

export async function richiediPrestito(copiaId: string, giocoId: string, utenteId: string): Promise<Prestito> {
  const prestito: Prestito = {
    id: prossimoIdPrestito(),
    copiaId,
    giocoId,
    utenteId,
    stato: "in_attesa",
    dataRichiesta: new Date().toISOString().slice(0, 10),
    dataApprovazione: null,
    approvatoDa: null,
    dataRestituzioneEffettiva: null,
    gestitoDa: null,
  };
  store.prestiti.push(prestito);
  return prestito;
}

export async function decidiPrestito(
  prestitoId: string,
  approva: boolean,
  gestoreNome: string,
  note?: string
): Promise<Prestito | null> {
  const prestito = store.prestiti.find((p) => p.id === prestitoId);
  if (!prestito) return null;
  prestito.stato = approva ? "in_corso" : "rifiutato";
  prestito.dataApprovazione = new Date().toISOString().slice(0, 10);
  prestito.approvatoDa = gestoreNome;
  if (note) prestito.note = note;
  return prestito;
}

export async function registraRientro(prestitoId: string, gestoreNome: string): Promise<Prestito | null> {
  const prestito = store.prestiti.find((p) => p.id === prestitoId);
  if (!prestito) return null;
  prestito.stato = "restituito";
  prestito.dataRestituzioneEffettiva = new Date().toISOString().slice(0, 10);
  prestito.gestitoDa = gestoreNome;
  return prestito;
}

export async function annullaPrestito(prestitoId: string): Promise<Prestito | null> {
  const prestito = store.prestiti.find((p) => p.id === prestitoId);
  if (!prestito) return null;
  prestito.stato = "annullato";
  return prestito;
}
