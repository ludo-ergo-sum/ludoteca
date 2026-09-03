import "server-only";
import { MongoServerError } from "mongodb";
import { daDocumento, getDb, idFiltro } from "@/lib/mongo";
import type { Prestito } from "@/lib/types";

type PrestitoDoc = Omit<Prestito, "id">;

const DURATA_PRESTITO_GIORNI = 360;
const GIORNI_PREAVVISO_PROMEMORIA = 3;

function prestitiColl() {
  return getDb().then((db) => db.collection<PrestitoDoc>("prestiti"));
}
function copieColl() {
  return getDb().then((db) => db.collection("copie"));
}

function aggiungiGiorni(dataIso: string, giorni: number): string {
  const data = new Date(dataIso);
  data.setDate(data.getDate() + giorni);
  return data.toISOString().slice(0, 10);
}

export async function getPrestiti(): Promise<Prestito[]> {
  const doc = await (await prestitiColl()).find().toArray();
  return doc.map(daDocumento);
}

export async function getPrestitiByUtente(utenteId: string): Promise<Prestito[]> {
  const doc = await (await prestitiColl()).find({ utenteId }).sort({ dataRichiesta: -1 }).toArray();
  return doc.map(daDocumento);
}

export async function getPrestitiInAttesa(): Promise<Prestito[]> {
  const doc = await (await prestitiColl()).find({ stato: "in_attesa" }).toArray();
  return doc.map(daDocumento);
}

export async function getPrestitoAttivoPerCopia(copiaId: string): Promise<Prestito | null> {
  const doc = await (await prestitiColl()).findOne({ copiaId, stato: { $in: ["in_corso", "approvato"] } });
  return doc ? daDocumento(doc) : null;
}

export async function getStoricoByCopia(copiaId: string): Promise<Prestito[]> {
  const doc = await (await prestitiColl()).find({ copiaId }).sort({ dataRichiesta: -1 }).toArray();
  return doc.map(daDocumento);
}

// Il campo stato della copia passa a "in_prestito" solo quando l'admin
// approva (vedi decidiPrestito), non alla richiesta. La protezione contro due
// richieste quasi simultanee sulla stessa copia e' l'indice unico parziale su
// prestiti.copiaId (vedi lib/mongo.ts): se questo insert viola l'indice
// (duplicate key, codice 11000) c'e' gia' un prestito attivo su questa copia,
// quindi si ritorna null esattamente come nel mock.
export async function richiediPrestito(
  copiaId: string,
  giocoId: string,
  utenteId: string
): Promise<Prestito | null> {
  const filtroCopia = idFiltro(copiaId);
  if (!filtroCopia) return null;
  const copia = await (await copieColl()).findOne(filtroCopia);
  if (!copia || copia.stato !== "disponibile") return null;

  const doc: PrestitoDoc = {
    copiaId,
    giocoId,
    utenteId,
    stato: "in_attesa",
    dataRichiesta: new Date().toISOString().slice(0, 10),
    dataApprovazione: null,
    approvatoDa: null,
    dataRestituzioneEffettiva: null,
    gestitoDa: null,
  };
  try {
    const risultato = await (await prestitiColl()).insertOne(doc);
    return daDocumento({ ...doc, _id: risultato.insertedId });
  } catch (errore) {
    if (errore instanceof MongoServerError && errore.code === 11000) return null;
    throw errore;
  }
}

export async function decidiPrestito(
  prestitoId: string,
  approva: boolean,
  gestoreNome: string,
  note?: string
): Promise<Prestito | null> {
  const filtro = idFiltro(prestitoId);
  if (!filtro) return null;
  const dataApprovazione = new Date().toISOString().slice(0, 10);
  const set: Partial<PrestitoDoc> = {
    stato: approva ? "in_corso" : "rifiutato",
    dataApprovazione,
    approvatoDa: gestoreNome,
  };
  if (note) set.note = note;
  if (approva) set.dataScadenza = aggiungiGiorni(dataApprovazione, DURATA_PRESTITO_GIORNI);
  const doc = await (await prestitiColl()).findOneAndUpdate(filtro, { $set: set }, { returnDocument: "after" });
  return doc ? daDocumento(doc) : null;
}

// Prestiti in corso la cui scadenza cade esattamente a "oggi + preavviso" e
// per cui il promemoria non e' ancora stato inviato (evita doppio invio se il
// cron gira piu' volte sullo stesso giorno).
export async function getPrestitiDaSollecitare(): Promise<Prestito[]> {
  const sogliaData = aggiungiGiorni(new Date().toISOString().slice(0, 10), GIORNI_PREAVVISO_PROMEMORIA);
  const doc = await (await prestitiColl())
    .find({ stato: "in_corso", dataScadenza: sogliaData, promemoriaInviato: { $ne: true } })
    .toArray();
  return doc.map(daDocumento);
}

export async function segnaPromemoriaInviato(prestitoId: string): Promise<void> {
  const filtro = idFiltro(prestitoId);
  if (!filtro) return;
  await (await prestitiColl()).updateOne(filtro, { $set: { promemoriaInviato: true } });
}

export async function registraRientro(prestitoId: string, gestoreNome: string): Promise<Prestito | null> {
  const filtro = idFiltro(prestitoId);
  if (!filtro) return null;
  const doc = await (await prestitiColl()).findOneAndUpdate(
    filtro,
    { $set: { stato: "restituito", dataRestituzioneEffettiva: new Date().toISOString().slice(0, 10), gestitoDa: gestoreNome } },
    { returnDocument: "after" }
  );
  return doc ? daDocumento(doc) : null;
}

export async function annullaPrestito(prestitoId: string): Promise<Prestito | null> {
  const filtro = idFiltro(prestitoId);
  if (!filtro) return null;
  const doc = await (await prestitiColl()).findOneAndUpdate(filtro, { $set: { stato: "annullato" } }, { returnDocument: "after" });
  return doc ? daDocumento(doc) : null;
}
