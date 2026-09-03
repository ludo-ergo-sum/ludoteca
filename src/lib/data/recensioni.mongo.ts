import "server-only";
import { daDocumento, getDb } from "@/lib/mongo";
import type { Recensione } from "@/lib/types";

type RecensioneDoc = Omit<Recensione, "id">;

function recensioniColl() {
  return getDb().then((db) => db.collection<RecensioneDoc>("recensioni"));
}

export async function getRecensioniByGioco(giocoId: string): Promise<Recensione[]> {
  const doc = await (await recensioniColl()).find({ giocoId }).sort({ data: -1 }).toArray();
  return doc.map(daDocumento);
}

export async function getRecensioneUtente(utenteId: string, giocoId: string): Promise<Recensione | null> {
  const doc = await (await recensioniColl()).findOne({ utenteId, giocoId });
  return doc ? daDocumento(doc) : null;
}

export async function getRecensioniByUtente(utenteId: string): Promise<Recensione[]> {
  const doc = await (await recensioniColl()).find({ utenteId }).toArray();
  return doc.map(daDocumento);
}

export async function getMediaVotiGioco(giocoId: string): Promise<{ media: number; numero: number } | null> {
  const voci = await (await recensioniColl()).find({ giocoId }).toArray();
  if (voci.length === 0) return null;
  const media = voci.reduce((somma, r) => somma + r.voto, 0) / voci.length;
  return { media, numero: voci.length };
}

// Un voto per socio per gioco: se esiste gia' una recensione la aggiorna
// invece di crearne una seconda (il socio puo' cambiare idea nel tempo).
export async function salvaRecensione(
  utenteId: string,
  giocoId: string,
  voto: number,
  commento: string | null
): Promise<Recensione> {
  const oggi = new Date().toISOString().slice(0, 10);
  const doc = await (await recensioniColl()).findOneAndUpdate(
    { utenteId, giocoId },
    { $set: { voto, commento, data: oggi } },
    { upsert: true, returnDocument: "after" }
  );
  return daDocumento(doc!);
}
