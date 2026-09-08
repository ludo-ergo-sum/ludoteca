import "server-only";
import { DATA_MOCK } from "@/lib/mongo";
import type { RichiestaAcquisto } from "@/lib/types";
import * as mock from "./richiesteAcquisto.mock";
import * as mongo from "./richiesteAcquisto.mongo";

const impl = DATA_MOCK ? mock : mongo;

export const getRichiesteNuove = impl.getRichiesteNuove;
export const getRichiesteGestite = impl.getRichiesteGestite;
export const contaRichiesteNuove = impl.contaRichiesteNuove;
export const creaRichiestaAcquisto = impl.creaRichiestaAcquisto;
export const segnaRichiestaGestita = impl.segnaRichiestaGestita;

// Paginazione lato db dello "Storico" (richieste gestite) in
// /admin/richieste-acquisto: le nuove restano una query diretta non
// paginata (coda di lavoro operativa, per natura limitata), lo storico
// invece cresce per sempre.
export interface FiltriRichieste {
  pagina: number;
  perPagina: number;
}

export interface PaginaRichieste {
  richieste: RichiestaAcquisto[];
  totale: number;
}
