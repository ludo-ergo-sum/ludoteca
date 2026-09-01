import "server-only";
import type { Copia, Gioco, Prestito } from "@/lib/types";
import { getPrestiti, getPrestitiByUtente, getPrestitiInAttesa } from "@/lib/data/loans";
import { getTutteLeCopie } from "@/lib/data/copies";
import { getGiochi } from "@/lib/data/games";

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
