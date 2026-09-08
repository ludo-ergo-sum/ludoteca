import "server-only";
import { daDocumento, getDb, idFiltro } from "@/lib/mongo";
import type { RichiestaAcquisto } from "@/lib/types";
import type { FiltriRichieste, PaginaRichieste } from "./richiesteAcquisto";
import { normalizzaPaginazione } from "./paginazione";

type RichiestaAcquistoDoc = Omit<RichiestaAcquisto, "id">;

function richiesteColl() {
  return getDb().then((db) => db.collection<RichiestaAcquistoDoc>("richiesteAcquisto"));
}

export async function getRichiesteNuove(): Promise<RichiestaAcquisto[]> {
  const doc = await (await richiesteColl()).find({ stato: "nuova" }).sort({ data: -1 }).toArray();
  return doc.map(daDocumento);
}

export async function contaRichiesteNuove(): Promise<number> {
  return (await richiesteColl()).countDocuments({ stato: "nuova" });
}

// "Storico" di /admin/richieste-acquisto: l'unico dei due elenchi che cresce
// per sempre (ogni richiesta gestita resta qui), quindi l'unico paginato.
export async function getRichiesteGestite(filtri: FiltriRichieste): Promise<PaginaRichieste> {
  const query = { stato: "gestita" as const };
  const { pagina, perPagina } = normalizzaPaginazione(filtri.pagina, filtri.perPagina);
  const coll = await richiesteColl();
  const salto = (pagina - 1) * perPagina;
  const [docs, totale] = await Promise.all([
    coll.find(query).sort({ data: -1 }).skip(salto).limit(perPagina).toArray(),
    coll.countDocuments(query),
  ]);
  return { richieste: docs.map(daDocumento), totale };
}

export async function creaRichiestaAcquisto(dati: {
  bggId: number;
  titolo: string;
  giocoBaseId: string;
  utenteId: string;
  messaggio?: string | null;
}): Promise<RichiestaAcquisto> {
  const doc: RichiestaAcquistoDoc = { ...dati, data: new Date().toISOString().slice(0, 10), stato: "nuova" };
  const risultato = await (await richiesteColl()).insertOne(doc);
  return daDocumento({ ...doc, _id: risultato.insertedId });
}

export async function segnaRichiestaGestita(id: string): Promise<RichiestaAcquisto | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const doc = await (await richiesteColl()).findOneAndUpdate(filtro, { $set: { stato: "gestita" } }, { returnDocument: "after" });
  return doc ? daDocumento(doc) : null;
}
