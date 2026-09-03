import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./terminiBgg.mock";
import * as mongo from "./terminiBgg.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getTermine = impl.getTermine;
export const salvaTraduzioneTermine = impl.salvaTraduzioneTermine;
export const getTuttiITermini = impl.getTuttiITermini;
export const aggiornaTraduzioneTermine = impl.aggiornaTraduzioneTermine;
export const getDescrizioniByTipo = impl.getDescrizioniByTipo;
