import "server-only";
import { store, prossimoIdRichiestaAcquisto } from "@/lib/mock/store";
import type { RichiestaAcquisto } from "@/lib/types";
import type { FiltriRichieste, PaginaRichieste } from "./richiesteAcquisto";
import { normalizzaPaginazione } from "./paginazione";

export async function getRichiesteNuove(): Promise<RichiestaAcquisto[]> {
  return store.richiesteAcquisto.filter((r) => r.stato === "nuova").sort((a, b) => b.data.localeCompare(a.data));
}

export async function contaRichiesteNuove(): Promise<number> {
  return store.richiesteAcquisto.filter((r) => r.stato === "nuova").length;
}

export async function getRichiesteGestite(filtri: FiltriRichieste): Promise<PaginaRichieste> {
  const filtrati = store.richiesteAcquisto
    .filter((r) => r.stato === "gestita")
    .sort((a, b) => b.data.localeCompare(a.data));

  const { pagina, perPagina } = normalizzaPaginazione(filtri.pagina, filtri.perPagina);
  const inizio = (pagina - 1) * perPagina;
  return { richieste: filtrati.slice(inizio, inizio + perPagina), totale: filtrati.length };
}

export async function creaRichiestaAcquisto(dati: {
  bggId: number;
  titolo: string;
  giocoBaseId: string;
  utenteId: string;
  messaggio?: string | null;
}): Promise<RichiestaAcquisto> {
  const richiesta: RichiestaAcquisto = {
    id: prossimoIdRichiestaAcquisto(),
    ...dati,
    data: new Date().toISOString().slice(0, 10),
    stato: "nuova",
  };
  store.richiesteAcquisto.push(richiesta);
  return richiesta;
}

export async function segnaRichiestaGestita(id: string): Promise<RichiestaAcquisto | null> {
  const richiesta = store.richiesteAcquisto.find((r) => r.id === id);
  if (!richiesta) return null;
  richiesta.stato = "gestita";
  return richiesta;
}
