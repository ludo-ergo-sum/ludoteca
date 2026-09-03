import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import * as mock from "./preferiti.mock";
import * as mongo from "./preferiti.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const isPreferito = impl.isPreferito;
export const getPreferitiByUtente = impl.getPreferitiByUtente;
export const getNumeroPreferitiGioco = impl.getNumeroPreferitiGioco;
export const toggleFavorito = impl.toggleFavorito;
