import "server-only";
import { store } from "@/lib/mock/store";
import type { QuotaAnnuale, Ruolo, Utente } from "@/lib/types";

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "admin@ludoergosum.it")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function getUtenteById(id: string): Promise<Utente | null> {
  return store.utenti.find((u) => u.id === id) ?? null;
}

export async function getUtenteByEmail(email: string): Promise<Utente | null> {
  return store.utenti.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getSocie(): Promise<Utente[]> {
  return store.utenti;
}

// Chiamata dal callback di NextAuth al primo login: crea il socio se non
// esiste ancora, cosi' l'iscrizione avviene semplicemente accedendo con
// Google la prima volta.
export async function trovaOCreaUtenteDaGoogle(profilo: {
  googleId: string;
  nome: string;
  email: string;
  immagine?: string | null;
}): Promise<{ utente: Utente; creato: boolean }> {
  const esistente = store.utenti.find((u) => u.googleId === profilo.googleId || u.email === profilo.email);
  if (esistente) {
    esistente.nome = profilo.nome;
    esistente.immagine = profilo.immagine ?? esistente.immagine;
    return { utente: esistente, creato: false };
  }

  const ruolo: Ruolo = ADMIN_EMAILS.includes(profilo.email.toLowerCase()) ? "admin" : "socio";
  const nuovo: Utente = {
    id: `u-${store.utenti.length + 1}-${Date.now().toString(36)}`,
    googleId: profilo.googleId,
    nome: profilo.nome,
    email: profilo.email,
    immagine: profilo.immagine ?? null,
    ruolo,
    dataIscrizione: new Date().toISOString().slice(0, 10),
    quote: [],
  };
  store.utenti.push(nuovo);
  return { utente: nuovo, creato: true };
}

export async function impostaRuolo(utenteId: string, ruolo: Ruolo): Promise<Utente | null> {
  const utente = store.utenti.find((u) => u.id === utenteId);
  if (!utente) return null;
  utente.ruolo = ruolo;
  return utente;
}

export async function impostaQuotaAnnuale(
  utenteId: string,
  anno: number,
  inRegola: boolean,
  registratoDa: string,
  note?: string
): Promise<Utente | null> {
  const utente = store.utenti.find((u) => u.id === utenteId);
  if (!utente) return null;

  const quota: QuotaAnnuale = {
    anno,
    inRegola,
    dataRegistrazione: inRegola ? new Date().toISOString().slice(0, 10) : null,
    registratoDa,
    note,
  };

  const esistenteIndex = utente.quote.findIndex((q) => q.anno === anno);
  if (esistenteIndex >= 0) {
    utente.quote[esistenteIndex] = quota;
  } else {
    utente.quote.push(quota);
    utente.quote.sort((a, b) => a.anno - b.anno);
  }
  return utente;
}

export function socioInRegolaPerAnno(utente: Utente, anno: number): boolean {
  return utente.quote.some((q) => q.anno === anno && q.inRegola);
}
