// Modelli dati condivisi. Le forme qui descritte corrispondono ai futuri
// documenti MongoDB: il layer mock in lib/data/* e' scritto in modo che possa
// essere sostituito da query Mongo senza cambiare le firme delle funzioni.

export type Ruolo = "socio" | "admin";

export type StatoCopia = "disponibile" | "in_prestito" | "offline";

export type StatoPrestito =
  | "in_attesa"
  | "approvato"
  | "rifiutato"
  | "in_corso"
  | "restituito"
  | "annullato";

export interface QuotaAnnuale {
  anno: number;
  inRegola: boolean;
  dataRegistrazione: string | null;
  registratoDa: string | null; // nome/email dell'amministratore
  note?: string;
}

export interface Utente {
  id: string;
  googleId: string;
  nome: string;
  email: string;
  immagine?: string | null;
  ruolo: Ruolo;
  dataIscrizione: string; // ISO date
  quote: QuotaAnnuale[]; // storico completo, piu' recente in fondo
}

export interface Gioco {
  id: string;
  slug: string;
  titolo: string;
  descrizione: string;
  immagine: string;
  categorie: string[];
  giocatoriMin: number;
  giocatoriMax: number;
  durataMinutiMin: number;
  durataMinutiMax: number;
  etaMinima: number;
  autore?: string;
  editore?: string;
  anno?: number;
  difficolta: 1 | 2 | 3 | 4 | 5;
  // Id del gioco su BoardGameGeek, usato per fare matching durante la sync
  // dal catalogo master dell'associazione. Assente per i giochi creati a mano.
  bggId?: number | null;
}

export interface Copia {
  id: string;
  giocoId: string;
  codice: string; // es. "SCA-01", univoco, stampato sul QR
  stato: StatoCopia;
  motivoOffline?: string | null;
  noteAdmin?: string | null; // visibile solo agli amministratori
  dataAcquisizione: string; // ISO date
}

export interface Prestito {
  id: string;
  copiaId: string;
  giocoId: string;
  utenteId: string;
  stato: StatoPrestito;
  dataRichiesta: string;
  dataApprovazione: string | null;
  approvatoDa: string | null;
  dataRestituzioneEffettiva: string | null;
  gestitoDa: string | null; // admin che ha registrato il rientro
  note?: string | null;
}

export interface GiocoConDisponibilita extends Gioco {
  copieTotali: number;
  copieDisponibili: number;
}
