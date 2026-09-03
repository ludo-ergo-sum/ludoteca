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
export const getSocie = impl.getSocie;
export const trovaOCreaUtenteDaGoogle = impl.trovaOCreaUtenteDaGoogle;
export const impostaRuolo = impl.impostaRuolo;
export const eliminaSocio = impl.eliminaSocio;
export const impostaQuotaAnnuale = impl.impostaQuotaAnnuale;

export function socioInRegolaPerAnno(utente: Utente, anno: number): boolean {
  return utente.quote.some((q) => q.anno === anno && q.inRegola);
}
