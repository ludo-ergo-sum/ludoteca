import "server-only";
import { daDocumento, getDb, idFiltro } from "@/lib/mongo";
import type { RichiestaAcquisto } from "@/lib/types";

type RichiestaAcquistoDoc = Omit<RichiestaAcquisto, "id">;

function richiesteColl() {
  return getDb().then((db) => db.collection<RichiestaAcquistoDoc>("richiesteAcquisto"));
}

export async function getRichiesteAcquisto(): Promise<RichiestaAcquisto[]> {
  const doc = await (await richiesteColl()).find().sort({ data: -1 }).toArray();
  return doc.map(daDocumento);
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
