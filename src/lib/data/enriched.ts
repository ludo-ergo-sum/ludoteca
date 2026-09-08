import "server-only";
import type { Copia, Gioco, GiocoConDisponibilita, Prestito, Recensione, RichiestaAcquisto, Utente } from "@/lib/types";
import { getPrestitiByUtente, getPrestitiInAttesa, getPrestitiInCorso, getPrestitiConclusi } from "@/lib/data/loans";
import { getCopieByIds } from "@/lib/data/copies";
import { getGiochi, getGiochiByIds } from "@/lib/data/games";
import { getRecensioniByGioco } from "@/lib/data/recensioni";
import { getPreferitiByUtente } from "@/lib/data/preferiti";
import { getRichiesteNuove, getRichiesteGestite } from "@/lib/data/richiesteAcquisto";
import { getSocie, getUtentiByIds } from "@/lib/data/users";

export interface PrestitoConDettagli extends Prestito {
  gioco: Gioco | null;
  copia: Copia | null;
  socio: Utente | null;
}

// Arricchisce solo con i giochi/copie/socie referenziati da questi prestiti
// (batch fetch per id), non l'intera collezione: la pagina chiamante decide
// gia' quale sottoinsieme di prestiti mostrare (in attesa/in corso/storico).
async function arricchisci(prestiti: Prestito[]): Promise<PrestitoConDettagli[]> {
  const giocoIds = Array.from(new Set(prestiti.map((p) => p.giocoId)));
  const copiaIds = Array.from(new Set(prestiti.map((p) => p.copiaId)));
  const utenteIds = Array.from(new Set(prestiti.map((p) => p.utenteId)));
  const [giochi, copie, utenti] = await Promise.all([
    getGiochiByIds(giocoIds),
    getCopieByIds(copiaIds),
    getUtentiByIds(utenteIds),
  ]);
  const giochiMap = new Map(giochi.map((g) => [g.id, g]));
  const copieMap = new Map(copie.map((c) => [c.id, c]));
  const utentiMap = new Map(utenti.map((u) => [u.id, u]));

  return prestiti.map((prestito) => ({
    ...prestito,
    gioco: giochiMap.get(prestito.giocoId) ?? null,
    copia: copieMap.get(prestito.copiaId) ?? null,
    socio: utentiMap.get(prestito.utenteId) ?? null,
  }));
}

export async function getPrestitiUtenteConDettagli(utenteId: string): Promise<PrestitoConDettagli[]> {
  return arricchisci(await getPrestitiByUtente(utenteId));
}

export async function getPrestitiInAttesaConDettagli(): Promise<PrestitoConDettagli[]> {
  return arricchisci(await getPrestitiInAttesa());
}

export async function getPrestitiInCorsoConDettagli(): Promise<PrestitoConDettagli[]> {
  return arricchisci(await getPrestitiInCorso());
}

export interface PaginaPrestitiConDettagli {
  prestiti: PrestitoConDettagli[];
  totale: number;
}

export async function getStoricoPrestitiConDettagli(filtri: {
  pagina: number;
  perPagina: number;
}): Promise<PaginaPrestitiConDettagli> {
  const { prestiti, totale } = await getPrestitiConclusi(filtri);
  return { prestiti: await arricchisci(prestiti), totale };
}

export interface RecensioneConAutore extends Recensione {
  autoreNome: string;
}

export async function getRecensioniConAutoreByGioco(giocoId: string): Promise<RecensioneConAutore[]> {
  const [recensioni, utenti] = await Promise.all([getRecensioniByGioco(giocoId), getSocie()]);
  const utentiMap = new Map(utenti.map((u) => [u.id, u]));
  return recensioni.map((r) => ({ ...r, autoreNome: utentiMap.get(r.utenteId)?.nome ?? "Socio" }));
}

export interface GiocoPreferito {
  gioco: GiocoConDisponibilita;
  data: string;
}

export async function getGiochiPreferitiByUtente(utenteId: string): Promise<GiocoPreferito[]> {
  const [preferiti, giochi] = await Promise.all([getPreferitiByUtente(utenteId), getGiochi()]);
  const giochiMap = new Map(giochi.map((g) => [g.id, g]));
  return preferiti
    .map((p) => ({ gioco: giochiMap.get(p.giocoId), data: p.data }))
    .filter((p): p is GiocoPreferito => p.gioco != null)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export interface RichiestaAcquistoConDettagli extends RichiestaAcquisto {
  autoreNome: string;
  giocoBaseTitolo: string;
}

// Come arricchisci() per i prestiti: batch fetch solo di socie/giochi
// referenziati da queste richieste, non l'intera collezione.
async function arricchisciRichieste(richieste: RichiestaAcquisto[]): Promise<RichiestaAcquistoConDettagli[]> {
  const utenteIds = Array.from(new Set(richieste.map((r) => r.utenteId)));
  const giocoIds = Array.from(new Set(richieste.map((r) => r.giocoBaseId)));
  const [utenti, giochi] = await Promise.all([getUtentiByIds(utenteIds), getGiochiByIds(giocoIds)]);
  const utentiMap = new Map(utenti.map((u) => [u.id, u]));
  const giochiMap = new Map(giochi.map((g) => [g.id, g]));
  return richieste.map((r) => ({
    ...r,
    autoreNome: utentiMap.get(r.utenteId)?.nome ?? "Socio",
    giocoBaseTitolo: giochiMap.get(r.giocoBaseId)?.titolo ?? "Gioco",
  }));
}

export async function getRichiesteNuoveConDettagli(): Promise<RichiestaAcquistoConDettagli[]> {
  return arricchisciRichieste(await getRichiesteNuove());
}

export interface PaginaRichiesteConDettagli {
  richieste: RichiestaAcquistoConDettagli[];
  totale: number;
}

export async function getRichiesteGestiteConDettagli(filtri: {
  pagina: number;
  perPagina: number;
}): Promise<PaginaRichiesteConDettagli> {
  const { richieste, totale } = await getRichiesteGestite(filtri);
  return { richieste: await arricchisciRichieste(richieste), totale };
}
