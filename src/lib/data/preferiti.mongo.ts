import "server-only";
import { getDb } from "@/lib/mongo";
import type { Preferito } from "@/lib/types";

function preferitiColl() {
  return getDb().then((db) => db.collection<Preferito>("preferiti"));
}

export async function isPreferito(utenteId: string, giocoId: string): Promise<boolean> {
  return (await (await preferitiColl()).countDocuments({ utenteId, giocoId })) > 0;
}

export async function getPreferitiByUtente(utenteId: string): Promise<Preferito[]> {
  return (await preferitiColl()).find({ utenteId }).project<Preferito>({ _id: 0 }).toArray();
}

export async function getNumeroPreferitiGioco(giocoId: string): Promise<number> {
  return (await preferitiColl()).countDocuments({ giocoId });
}

// Ritorna il nuovo stato (true = appena aggiunto, false = appena rimosso).
export async function toggleFavorito(utenteId: string, giocoId: string): Promise<boolean> {
  const coll = await preferitiColl();
  const risultato = await coll.deleteOne({ utenteId, giocoId });
  if (risultato.deletedCount > 0) return false;
  await coll.insertOne({ utenteId, giocoId, data: new Date().toISOString().slice(0, 10) });
  return true;
}
