import "server-only";
import { store, prossimoIdRichiestaAcquisto } from "@/lib/mock/store";
import type { RichiestaAcquisto } from "@/lib/types";

export async function getRichiesteAcquisto(): Promise<RichiestaAcquisto[]> {
  return [...store.richiesteAcquisto].sort((a, b) => b.data.localeCompare(a.data));
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
