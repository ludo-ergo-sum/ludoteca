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
  // Versione piccola di "immagine" fornita direttamente da BGG (campo
  // thumbnail), usata dove serve un'anteprima piccola invece di ridimensionare
  // via CSS l'immagine grande. Assente per i giochi creati a mano.
  miniatura?: string;
  categorie: string[];
  giocatoriMin: number;
  giocatoriMax: number;
  durataMinutiMin: number;
  durataMinutiMax: number;
  etaMinima: number;
  autore?: string[];
  editore?: string[];
  illustratori?: string[];
  meccaniche?: string[];
  anno?: number;
  difficolta: 1 | 2 | 3 | 4 | 5;
  // Id del gioco su BoardGameGeek, usato per fare matching durante la sync
  // dal catalogo master dell'associazione. Assente per i giochi creati a mano.
  bggId?: number | null;
  // true se un admin ha modificato a mano questo gioco dopo l'import: la
  // sync BGG non lo sovrascrive piu' finche' non viene riabilitata a mano.
  bggSyncBloccata?: boolean;
  // ISO date, impostata solo alla creazione (mai aggiornata dai sync
  // successivi): quando il gioco e' stato importato da BGG per la prima volta.
  dataImportazioneBgg?: string | null;
  // Valutazione media e numero di voti su BGG: sempre da sync, mai
  // editabili a mano (come bggId), sovrascritti a ogni sync successivo.
  bggValutazioneMedia?: number | null;
  bggNumeroVoti?: number | null;
  // Espansioni collegate su BGG: solo link verso la scheda BGG, non
  // importate come giochi propri nel catalogo.
  espansioni?: { bggId: number; titolo: string }[];
}

export interface Copia {
  id: string;
  giocoId: string;
  codice: string; // es. "SCA-01", univoco, stampato sul QR
  stato: StatoCopia;
  motivoOffline?: string | null;
  noteAdmin?: string | null; // visibile solo agli amministratori
  dataAcquisizione: string; // ISO date
  // ISO date dell'ultima volta che e' stata generata l'etichetta da
  // stampare per questa copia (nome gioco + codice + QR). Assente/null =
  // non ancora stampata.
  dataStampaEtichetta?: string | null;
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
  dataScadenza?: string | null; // ISO date, calcolata all'approvazione
  promemoriaInviato?: boolean; // evita un doppio invio del promemoria di restituzione
}

export interface GiocoConDisponibilita extends Gioco {
  copieTotali: number;
  copieDisponibili: number;
}

export interface Recensione {
  id: string;
  giocoId: string;
  utenteId: string;
  voto: number; // 1-10
  commento?: string | null;
  data: string; // ISO date, ultima modifica
}

export interface Preferito {
  utenteId: string;
  giocoId: string;
  data: string; // ISO date di aggiunta
}

export type StatoRichiestaAcquisto = "nuova" | "gestita";

// Nasce quando un socio segnala, dalla pagina di un gioco, un'espansione BGG
// che non abbiamo ancora in catalogo.
export interface RichiestaAcquisto {
  id: string;
  bggId: number; // id BGG dell'espansione suggerita
  titolo: string; // titolo dell'espansione
  giocoBaseId: string; // il gioco di cui e' espansione, per contesto admin
  utenteId: string;
  messaggio?: string | null;
  data: string; // ISO date
  stato: StatoRichiestaAcquisto;
}

export type TipoTermineBgg = "categoria" | "meccanica";

// Anagrafica delle traduzioni EN -> IT per categorie/meccaniche BGG: sono un
// vocabolario chiuso (poche decine di valori), quindi si traduce ogni nome
// una sola volta e si riusa per tutti i giochi/sync successivi. Il confronto
// con nomeInglese e' sempre case-insensitive.
export interface TerminBgg {
  tipo: TipoTermineBgg;
  nomeInglese: string;
  nomeItaliano: string;
}
