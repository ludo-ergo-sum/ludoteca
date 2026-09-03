import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./recensioni.mock";
import * as mongo from "./recensioni.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getRecensioniByGioco = impl.getRecensioniByGioco;
export const getRecensioneUtente = impl.getRecensioneUtente;
export const getRecensioniByUtente = impl.getRecensioniByUtente;
export const getMediaVotiGioco = impl.getMediaVotiGioco;
export const salvaRecensione = impl.salvaRecensione;
