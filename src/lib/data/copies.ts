import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./copies.mock";
import * as mongo from "./copies.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getCopieByGioco = impl.getCopieByGioco;
export const getCopiaByCodice = impl.getCopiaByCodice;
export const getCopiaById = impl.getCopiaById;
export const getTutteLeCopie = impl.getTutteLeCopie;
export const getCopieSenzaEtichetta = impl.getCopieSenzaEtichetta;
export const segnaEtichetteStampate = impl.segnaEtichetteStampate;
export const creaCopia = impl.creaCopia;
export const impostaStatoCopia = impl.impostaStatoCopia;
export const aggiornaNoteAdmin = impl.aggiornaNoteAdmin;
