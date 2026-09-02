import "server-only";
import type { Copia, Gioco, GiocoConDisponibilita, Prestito, Recensione, RichiestaAcquisto } from "@/lib/types";
import { getPrestiti, getPrestitiByUtente, getPrestitiInAttesa } from "@/lib/data/loans";
import { getTutteLeCopie } from "@/lib/data/copies";
import { getGiochi } from "@/lib/data/games";
import { getRecensioniByGioco } from "@/lib/data/recensioni";
import { getPreferitiByUtente } from "@/lib/data/preferiti";
import { getRichiesteAcquisto } from "@/lib/data/richiesteAcquisto";
import { getSocie } from "@/lib/data/users";

export interface PrestitoConDettagli extends Prestito {
  gioco: Gioco | null;
  copia: Copia | null;
}

async function arricchisci(prestiti: Prestito[]): Promise<PrestitoConDettagli[]> {
  const [giochi, copie] = await Promise.all([getGiochi(), getTutteLeCopie()]);
  const giochiMap = new Map(giochi.map((g) => [g.id, g]));
  const copieMap = new Map(copie.map((c) => [c.id, c]));

  return prestiti.map((prestito) => ({
    ...prestito,
    gioco: giochiMap.get(prestito.giocoId) ?? null,
    copia: copieMap.get(prestito.copiaId) ?? null,
  }));
}

export async function getPrestitiUtenteConDettagli(utenteId: string): Promise<PrestitoConDettagli[]> {
  return arricchisci(await getPrestitiByUtente(utenteId));
}

export async function getPrestitiInAttesaConDettagli(): Promise<PrestitoConDettagli[]> {
  return arricchisci(await getPrestitiInAttesa());
}

export async function getTuttiIPrestitiConDettagli(): Promise<PrestitoConDettagli[]> {
  const prestiti = await getPrestiti();
  return arricchisci([...prestiti].sort((a, b) => b.dataRichiesta.localeCompare(a.dataRichiesta)));
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

export async function getRichiesteAcquistoConDettagli(): Promise<RichiestaAcquistoConDettagli[]> {
  const [richieste, utenti, giochi] = await Promise.all([getRichiesteAcquisto(), getSocie(), getGiochi()]);
  const utentiMap = new Map(utenti.map((u) => [u.id, u]));
  const giochiMap = new Map(giochi.map((g) => [g.id, g]));
  return richieste.map((r) => ({
    ...r,
    autoreNome: utentiMap.get(r.utenteId)?.nome ?? "Socio",
    giocoBaseTitolo: giochiMap.get(r.giocoBaseId)?.titolo ?? "Gioco",
  }));
}
