import "server-only";
import { store, prossimoIdPrestito } from "@/lib/mock/store";
import type { Prestito } from "@/lib/types";

const DURATA_PRESTITO_GIORNI = 360;
const GIORNI_PREAVVISO_PROMEMORIA = 3;

function aggiungiGiorni(dataIso: string, giorni: number): string {
  const data = new Date(dataIso);
  data.setDate(data.getDate() + giorni);
  return data.toISOString().slice(0, 10);
}

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
  if (approva) prestito.dataScadenza = aggiungiGiorni(prestito.dataApprovazione, DURATA_PRESTITO_GIORNI);
  return prestito;
}

// Prestiti in corso la cui scadenza cade esattamente a "oggi + preavviso" e
// per cui il promemoria non e' ancora stato inviato (evita doppio invio se il
// cron gira piu' volte sullo stesso giorno).
export async function getPrestitiDaSollecitare(): Promise<Prestito[]> {
  const sogliaData = aggiungiGiorni(new Date().toISOString().slice(0, 10), GIORNI_PREAVVISO_PROMEMORIA);
  return store.prestiti.filter(
    (p) => p.stato === "in_corso" && p.dataScadenza === sogliaData && !p.promemoriaInviato
  );
}

export async function segnaPromemoriaInviato(prestitoId: string): Promise<void> {
  const prestito = store.prestiti.find((p) => p.id === prestitoId);
  if (prestito) prestito.promemoriaInviato = true;
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
