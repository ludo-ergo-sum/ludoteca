import "server-only";
import { store, prossimoIdGioco } from "@/lib/mock/store";
import type { Gioco, GiocoConDisponibilita } from "@/lib/types";

function conDisponibilita(gioco: Gioco): GiocoConDisponibilita {
  const copie = store.copie.filter((c) => c.giocoId === gioco.id);
  return {
    ...gioco,
    copieTotali: copie.length,
    copieDisponibili: copie.filter((c) => c.stato === "disponibile").length,
  };
}

export async function getGiochi(): Promise<GiocoConDisponibilita[]> {
  return store.giochi.map(conDisponibilita);
}

export async function getGiocoBySlug(slug: string): Promise<GiocoConDisponibilita | null> {
  const gioco = store.giochi.find((g) => g.slug === slug);
  return gioco ? conDisponibilita(gioco) : null;
}

export async function getGiocoById(id: string): Promise<Gioco | null> {
  return store.giochi.find((g) => g.id === id) ?? null;
}

export async function getGiocoByBggId(bggId: number): Promise<Gioco | null> {
  return store.giochi.find((g) => g.bggId === bggId) ?? null;
}

// Elimina anche le copie del gioco (altrimenti resterebbero orfane). Lo
// storico prestiti che referenzia queste copie/questo gioco resta invece
// intatto: gia' gestisce gioco/copia assenti (vedi PrestitoConDettagli).
// Se il gioco proviene da BGG, la prossima sync lo ricrea da capo.
export async function eliminaGioco(id: string): Promise<boolean> {
  const indice = store.giochi.findIndex((g) => g.id === id);
  if (indice === -1) return false;
  store.giochi.splice(indice, 1);
  for (let i = store.copie.length - 1; i >= 0; i--) {
    if (store.copie[i].giocoId === id) store.copie.splice(i, 1);
  }
  return true;
}

export interface DatiNuovoGioco {
  titolo: string;
  descrizione: string;
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
}

function slugifica(titolo: string): string {
  return titolo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Il form manuale ha un campo di testo unico per autore/editore: qui si
// converte nell'array che il modello dati usa uniformemente (coerente con
// cio' che arriva dalla sync BGG, che puo' avere piu' di un nome).
export async function creaGioco(dati: DatiNuovoGioco): Promise<Gioco> {
  const { autore, editore, ...resto } = dati;
  const gioco: Gioco = {
    id: prossimoIdGioco(),
    slug: slugifica(dati.titolo),
    immagine: "",
    bggId: null,
    ...resto,
    autore: autore ? [autore] : undefined,
    editore: editore ? [editore] : undefined,
  };
  store.giochi.push(gioco);
  return gioco;
}

export interface DatiModificaGioco {
  titolo: string;
  descrizione: string;
  immagine: string;
  miniatura?: string;
  categorie: string[];
  meccaniche?: string[];
  giocatoriMin: number;
  giocatoriMax: number;
  durataMinutiMin: number;
  durataMinutiMax: number;
  etaMinima: number;
  autore?: string[];
  editore?: string[];
  illustratori?: string[];
  anno?: number;
  difficolta: 1 | 2 | 3 | 4 | 5;
}

// Form di modifica in /admin/giochi/[id]: a differenza di creaGioco, qui si
// modifica un gioco che puo' provenire dalla sync BGG, quindi bisogna anche
// decidere se la sync deve poter tornare a sovrascriverlo (permettiSyncBgg).
export async function aggiornaGioco(
  id: string,
  dati: DatiModificaGioco,
  permettiSyncBgg: boolean
): Promise<Gioco | null> {
  const gioco = store.giochi.find((g) => g.id === id);
  if (!gioco) return null;
  Object.assign(gioco, dati);
  gioco.bggSyncBloccata = !permettiSyncBgg;
  return gioco;
}

export interface DatiGiocoBgg {
  bggId: number;
  titolo: string;
  descrizione: string;
  immagine: string;
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
  bggValutazioneMedia?: number;
  bggNumeroVoti?: number;
  espansioni?: { bggId: number; titolo: string }[];
}

// Sync one-way dal catalogo master su BoardGameGeek: se esiste gia' un gioco
// con questo bggId ne aggiorna i dati (senza toccare id/slug, per non rompere
// QR/copie/URL gia' in circolazione), altrimenti lo crea.
export async function sincronizzaGiocoDaBgg(
  dati: DatiGiocoBgg
): Promise<{ gioco: Gioco; creato: boolean }> {
  const esistente = store.giochi.find((g) => g.bggId === dati.bggId);
  if (esistente) {
    // Rete di sicurezza oltre al filtro fatto a monte in syncBgg.ts: un
    // admin ha modificato questo gioco a mano, la sync non lo tocca piu'.
    if (esistente.bggSyncBloccata) return { gioco: esistente, creato: false };
    Object.assign(esistente, dati);
    return { gioco: esistente, creato: false };
  }

  const gioco: Gioco = {
    id: prossimoIdGioco(),
    slug: slugifica(dati.titolo),
    ...dati,
    dataImportazioneBgg: new Date().toISOString().slice(0, 10),
  };
  store.giochi.push(gioco);
  return { gioco, creato: true };
}
