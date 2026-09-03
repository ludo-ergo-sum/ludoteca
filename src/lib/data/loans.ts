import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./loans.mock";
import * as mongo from "./loans.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getPrestiti = impl.getPrestiti;
export const getPrestitiByUtente = impl.getPrestitiByUtente;
export const getPrestitiInAttesa = impl.getPrestitiInAttesa;
export const getPrestitoAttivoPerCopia = impl.getPrestitoAttivoPerCopia;
export const getStoricoByCopia = impl.getStoricoByCopia;
export const richiediPrestito = impl.richiediPrestito;
export const decidiPrestito = impl.decidiPrestito;
export const getPrestitiDaSollecitare = impl.getPrestitiDaSollecitare;
export const segnaPromemoriaInviato = impl.segnaPromemoriaInviato;
export const registraRientro = impl.registraRientro;
export const annullaPrestito = impl.annullaPrestito;
