import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import type { Prestito } from "@/lib/types";
import * as mock from "./loans.mock";
import * as mongo from "./loans.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getPrestitiByUtente = impl.getPrestitiByUtente;
export const getPrestitiInAttesa = impl.getPrestitiInAttesa;
export const getPrestitiInCorso = impl.getPrestitiInCorso;
export const getPrestitiConclusi = impl.getPrestitiConclusi;
export const contaPrestitiInAttesa = impl.contaPrestitiInAttesa;
export const getPrestitoAttivoPerCopia = impl.getPrestitoAttivoPerCopia;
export const getStoricoByCopia = impl.getStoricoByCopia;
export const richiediPrestito = impl.richiediPrestito;
export const decidiPrestito = impl.decidiPrestito;
export const getPrestitiDaSollecitare = impl.getPrestitiDaSollecitare;
export const segnaPromemoriaInviato = impl.segnaPromemoriaInviato;
export const registraRientro = impl.registraRientro;
export const annullaPrestito = impl.annullaPrestito;

// Paginazione lato db di "Storico completo" in /admin/prestiti: gli stati
// "in attesa"/"in corso" restano query dirette non paginate (insieme di
// lavoro operativo, per natura limitato), lo storico invece cresce per
// sempre con ogni prestito concluso.
export interface FiltriPrestiti {
  pagina: number;
  perPagina: number;
}

export interface PaginaPrestiti {
  prestiti: Prestito[];
  totale: number;
}
