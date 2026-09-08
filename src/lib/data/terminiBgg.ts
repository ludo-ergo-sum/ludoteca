import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import type { TerminBgg, TipoTermineBgg } from "@/lib/types";
import * as mock from "./terminiBgg.mock";
import * as mongo from "./terminiBgg.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getTermine = impl.getTermine;
export const salvaTraduzioneTermine = impl.salvaTraduzioneTermine;
export const getTuttiITermini = impl.getTuttiITermini;
export const getTerminiAdmin = impl.getTerminiAdmin;
export const aggiornaTraduzioneTermine = impl.aggiornaTraduzioneTermine;
export const getDescrizioniByTipo = impl.getDescrizioniByTipo;

// Paginazione + filtri lato db di /admin/traduzioni: oltre al tipo
// (categoria/meccanica, gia' due sezioni separate), un tab su daRitradurre e
// un filtro sulla presenza di descrizione — nessuno dei due era finora
// espresso lato db, si filtrava sempre l'intera collezione in memoria.
export interface FiltriTermini {
  tipo: TipoTermineBgg;
  // undefined = tutti, true = solo "da tradurre" (daRitradurre:true), false = solo "tradotte"
  daRitradurre?: boolean;
  // undefined = tutti, true = solo con descrizione, false = solo senza
  conDescrizione?: boolean;
  pagina: number;
  perPagina: number;
}

export interface PaginaTermini {
  termini: TerminBgg[];
  totale: number;
}
