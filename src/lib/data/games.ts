import "server-only";
import { store, prossimoIdGioco } from "@/lib/mock/store";
import type { Gioco, GiocoConDisponibilita } from "@/lib/types";

function conDisponibilita(gioco: Gioco): GiocoConDisponibilita {
  const copie = store.copie.filter((c) => c.giocoId === gioco.id);
  return {
    ...gioco,
    copieTotali: copie.length,
    copieDisponibili: copie.filter((c) => c.stato === "disponibile").length,
  };
}

export async function getGiochi(): Promise<GiocoConDisponibilita[]> {
  return store.giochi.map(conDisponibilita);
}

export async function getGiocoBySlug(slug: string): Promise<GiocoConDisponibilita | null> {
  const gioco = store.giochi.find((g) => g.slug === slug);
  return gioco ? conDisponibilita(gioco) : null;
}

export async function getGiocoById(id: string): Promise<Gioco | null> {
  return store.giochi.find((g) => g.id === id) ?? null;
}

export interface DatiNuovoGioco {
  titolo: string;
  descrizione: string;
  categorie: string[];
  giocatoriMin: number;
  giocatoriMax: number;
  durataMinutiMin: number;
  durataMinutiMax: number;
  etaMinima: number;
  autore?: string;
  editore?: string;
  anno?: number;
  difficolta: 1 | 2 | 3 | 4 | 5;
}

function slugifica(titolo: string): string {
  return titolo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function creaGioco(dati: DatiNuovoGioco): Promise<Gioco> {
  const gioco: Gioco = {
    id: prossimoIdGioco(),
    slug: slugifica(dati.titolo),
    immagine: "",
    ...dati,
  };
  store.giochi.push(gioco);
  return gioco;
}

export async function aggiornaGioco(id: string, dati: Partial<DatiNuovoGioco>): Promise<Gioco | null> {
  const gioco = store.giochi.find((g) => g.id === id);
  if (!gioco) return null;
  Object.assign(gioco, dati);
  return gioco;
}
