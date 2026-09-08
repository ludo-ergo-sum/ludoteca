import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import type { Utente } from "@/lib/types";
import * as mock from "./users.mock";
import * as mongo from "./users.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "admin@ludoergosum.it")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const getUtenteById = impl.getUtenteById;
export const getUtenteByEmail = impl.getUtenteByEmail;
export const getUtentiByIds = impl.getUtentiByIds;
export const getSocie = impl.getSocie;
export const getAdmins = impl.getAdmins;
export const getSocieAdmin = impl.getSocieAdmin;
export const contaSocieNonInRegola = impl.contaSocieNonInRegola;
export const trovaOCreaUtenteDaGoogle = impl.trovaOCreaUtenteDaGoogle;
export const impostaRuolo = impl.impostaRuolo;
export const eliminaSocio = impl.eliminaSocio;
export const impostaQuotaAnnuale = impl.impostaQuotaAnnuale;

export function socioInRegolaPerAnno(utente: Utente, anno: number): boolean {
  return utente.quote.some((q) => q.anno === anno && q.inRegola);
}

// Paginazione lato db di /admin/socie: il tab Tutte/Da-rinnovare/In-regola e'
// una query sulla quota dell'anno indicato, non un filtro in memoria su tutti
// i socie/e (vedi getSocieAdmin in users.mongo.ts/users.mock.ts).
export type FiltroSocie = "tutti" | "da_rinnovare" | "in_regola";

export interface FiltriSocieAdmin {
  filtro: FiltroSocie;
  anno: number;
  pagina: number;
  perPagina: number;
}

export interface PaginaSocie {
  utenti: Utente[];
  totale: number;
}
