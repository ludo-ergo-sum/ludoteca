import "server-only";
import { ObjectId } from "mongodb";
import { daDocumento, getDb, idFiltro } from "@/lib/mongo";
import type { Copia, StatoCopia } from "@/lib/types";

type CopiaDoc = Omit<Copia, "id">;

function copieColl() {
  return getDb().then((db) => db.collection<CopiaDoc>("copie"));
}

function escapeRegExp(testo: string): string {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getCopieByGioco(giocoId: string): Promise<Copia[]> {
  const doc = await (await copieColl()).find({ giocoId }).toArray();
  return doc.map(daDocumento);
}

export async function getCopiaByCodice(codice: string): Promise<Copia | null> {
  const doc = await (await copieColl()).findOne({ codice: { $regex: `^${escapeRegExp(codice)}$`, $options: "i" } });
  return doc ? daDocumento(doc) : null;
}

export async function getCopiaById(id: string): Promise<Copia | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const doc = await (await copieColl()).findOne(filtro);
  return doc ? daDocumento(doc) : null;
}

export async function getTutteLeCopie(): Promise<Copia[]> {
  const doc = await (await copieColl()).find().toArray();
  return doc.map(daDocumento);
}

export async function getCopieSenzaEtichetta(): Promise<Copia[]> {
  const doc = await (await copieColl()).find({ dataStampaEtichetta: { $in: [null, undefined] } }).toArray();
  return doc.map(daDocumento);
}

export async function segnaEtichetteStampate(copiaIds: string[]): Promise<void> {
  const oggi = new Date().toISOString().slice(0, 10);
  const ids = copiaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (ids.length === 0) return;
  await (await copieColl()).updateMany({ _id: { $in: ids } }, { $set: { dataStampaEtichetta: oggi } });
}

async function prossimoNumeroPerPrefisso(prefisso: string): Promise<number> {
  const esistenti = await (await copieColl()).countDocuments({ codice: { $regex: `^${escapeRegExp(prefisso)}-` } });
  return esistenti + 1;
}

export async function creaCopia(giocoId: string, prefissoCodice: string): Promise<Copia> {
  const numero = await prossimoNumeroPerPrefisso(prefissoCodice);
  const doc: CopiaDoc = {
    giocoId,
    codice: `${prefissoCodice}-${String(numero).padStart(2, "0")}`,
    stato: "disponibile",
    noteAdmin: null,
    dataAcquisizione: new Date().toISOString().slice(0, 10),
  };
  const risultato = await (await copieColl()).insertOne(doc);
  return daDocumento({ ...doc, _id: risultato.insertedId });
}

export async function impostaStatoCopia(
  id: string,
  stato: StatoCopia,
  extra?: { motivoOffline?: string | null }
): Promise<Copia | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const set: Partial<CopiaDoc> = { stato };
  if (stato !== "offline") {
    set.motivoOffline = null;
  } else if (extra?.motivoOffline !== undefined) {
    set.motivoOffline = extra.motivoOffline;
  }
  const doc = await (await copieColl()).findOneAndUpdate(filtro, { $set: set }, { returnDocument: "after" });
  return doc ? daDocumento(doc) : null;
}

export async function aggiornaNoteAdmin(id: string, noteAdmin: string): Promise<Copia | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const doc = await (await copieColl()).findOneAndUpdate(
    filtro,
    { $set: { noteAdmin } },
    { returnDocument: "after" }
  );
  return doc ? daDocumento(doc) : null;
}
