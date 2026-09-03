import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./games.mock";
import * as mongo from "./games.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getGiochi = impl.getGiochi;
export const getGiocoBySlug = impl.getGiocoBySlug;
export const getGiocoById = impl.getGiocoById;
export const getGiocoByBggId = impl.getGiocoByBggId;
export const eliminaGioco = impl.eliminaGioco;
export const creaGioco = impl.creaGioco;
export const aggiornaGioco = impl.aggiornaGioco;
export const sincronizzaGiocoDaBgg = impl.sincronizzaGiocoDaBgg;

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
