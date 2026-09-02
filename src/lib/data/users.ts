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

// Elimina anche preferiti/recensioni/richieste d'acquisto del socio (altrimenti
// resterebbero orfani). Lo storico prestiti resta invece intatto (stesso
// approccio di eliminaGioco in games.ts): la pagina admin/prestiti mostra
// gia' un nome vuoto per un socio assente, senza errori. Il controllo "nessun
// prestito attivo" e' responsabilita' del chiamante (vedi eliminaSocioAction).
export async function eliminaSocio(utenteId: string): Promise<boolean> {
  const indice = store.utenti.findIndex((u) => u.id === utenteId);
  if (indice === -1) return false;
  store.utenti.splice(indice, 1);
  for (let i = store.preferiti.length - 1; i >= 0; i--) {
    if (store.preferiti[i].utenteId === utenteId) store.preferiti.splice(i, 1);
  }
  for (let i = store.recensioni.length - 1; i >= 0; i--) {
    if (store.recensioni[i].utenteId === utenteId) store.recensioni.splice(i, 1);
  }
  for (let i = store.richiesteAcquisto.length - 1; i >= 0; i--) {
    if (store.richiesteAcquisto[i].utenteId === utenteId) store.richiesteAcquisto.splice(i, 1);
  }
  return true;
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
