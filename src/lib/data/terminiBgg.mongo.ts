import "server-only";
import type { Filter, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import type { TerminBgg, TipoTermineBgg } from "@/lib/types";
import type { FiltriTermini, PaginaTermini } from "./terminiBgg";
import { normalizzaPaginazione } from "./paginazione";

type TerminBggDoc = TerminBgg & { _id: ObjectId };

function terminiColl() {
  return getDb().then((db) => db.collection<TerminBgg>("terminiBgg"));
}
function giochiColl() {
  return getDb().then((db) => db.collection("giochi"));
}

// Nessun id proprio (chiave naturale tipo+nomeInglese): qui basta togliere
// l'_id di Mongo, non serve rimapparlo su un campo id come daDocumento.
function senzaId(doc: TerminBggDoc): TerminBgg {
  const { _id, ...resto } = doc;
  return resto;
}

function escapeRegExp(testo: string): string {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function filtroTermine(tipo: TipoTermineBgg, nomeInglese: string) {
  return { tipo, nomeInglese: { $regex: `^${escapeRegExp(nomeInglese)}$`, $options: "i" } };
}

export async function getTermine(tipo: TipoTermineBgg, nomeInglese: string): Promise<TerminBgg | null> {
  const doc = await (await terminiColl()).findOne(filtroTermine(tipo, nomeInglese));
  return doc ? senzaId(doc as TerminBggDoc) : null;
}

// Propaga un cambio di nomeItaliano ai giochi che usano gia' il valore
// vecchio: altrimenti si vedrebbe solo sui prossimi giochi importati,
// lasciando quelli gia' sincronizzati indietro. Condivisa da salvaTraduzioneTermine
// (sync) e aggiornaTraduzioneTermine (correzione manuale in admin).
async function propagaCambioTermine(tipo: TipoTermineBgg, vecchio: string, nuovo: string): Promise<void> {
  if (vecchio === nuovo) return;
  const campo = tipo === "categoria" ? "categorie" : "meccaniche";
  await (await giochiColl()).updateMany(
    { [campo]: vecchio },
    { $set: { [`${campo}.$[elem]`]: nuovo } },
    { arrayFilters: [{ elem: vecchio }] }
  );
}

// Upsert: la sync la chiama sia per termini nuovi sia per ritradurre un
// segnaposto in inglese (daRitradurre) una volta che DeepL e' di nuovo
// attivo — deve aggiornare la riga esistente, non duplicarla.
export async function salvaTraduzioneTermine(
  tipo: TipoTermineBgg,
  nomeInglese: string,
  nomeItaliano: string,
  daRitradurre = false
): Promise<void> {
  const coll = await terminiColl();
  const esistente = await coll.findOne(filtroTermine(tipo, nomeInglese));
  if (esistente) {
    await coll.updateOne(
      { _id: esistente._id },
      { $set: { nomeItaliano, daRitradurre: daRitradurre || undefined } }
    );
    await propagaCambioTermine(tipo, esistente.nomeItaliano, nomeItaliano);
    return;
  }
  await coll.insertOne({ tipo, nomeInglese, nomeItaliano, daRitradurre: daRitradurre || undefined });
}

export async function getTuttiITermini(): Promise<TerminBgg[]> {
  const doc = await (await terminiColl()).find().sort({ tipo: 1, nomeInglese: 1 }).toArray();
  return doc.map((d) => senzaId(d as TerminBggDoc));
}

// Paginazione + filtri lato db di /admin/traduzioni: tipo (sezione
// categoria/meccanica), tab "da tradurre"/"tradotte" e filtro con/senza
// descrizione, invece di caricare tutto il vocabolario e filtrarlo in JS.
export async function getTerminiAdmin(filtri: FiltriTermini): Promise<PaginaTermini> {
  const query: Filter<TerminBgg> = { tipo: filtri.tipo };
  if (filtri.daRitradurre === true) {
    query.daRitradurre = true;
  } else if (filtri.daRitradurre === false) {
    query.daRitradurre = { $ne: true };
  }
  if (filtri.conDescrizione === true) {
    query.descrizione = { $exists: true, $ne: "" };
  } else if (filtri.conDescrizione === false) {
    query.$or = [{ descrizione: { $exists: false } }, { descrizione: "" }];
  }

  const { pagina, perPagina } = normalizzaPaginazione(filtri.pagina, filtri.perPagina);
  const coll = await terminiColl();
  const salto = (pagina - 1) * perPagina;
  const [docs, totale] = await Promise.all([
    coll.find(query).sort({ nomeInglese: 1 }).skip(salto).limit(perPagina).toArray(),
    coll.countDocuments(query),
  ]);
  return { termini: docs.map((d) => senzaId(d as TerminBggDoc)), totale };
}

// Correzione manuale da /admin/traduzioni: conta sempre come traduzione
// vera, quindi azzera daRitradurre anche se era stato salvato come
// segnaposto. La descrizione (facoltativa) viene salvata insieme, stesso
// form/bottone.
export async function aggiornaTraduzioneTermine(
  tipo: TipoTermineBgg,
  nomeInglese: string,
  nomeItaliano: string,
  descrizione?: string
): Promise<void> {
  const coll = await terminiColl();
  const termine = await coll.findOne(filtroTermine(tipo, nomeInglese));
  if (!termine) return;

  await coll.updateOne(
    { _id: termine._id },
    { $set: { nomeItaliano, descrizione: descrizione || undefined, daRitradurre: undefined } }
  );
  await propagaCambioTermine(tipo, termine.nomeItaliano, nomeItaliano);
}

// Mappa nomeItaliano (minuscolo) -> descrizione, per i chip categoria/
// meccanica nel catalogo e nel dettaglio gioco (che mostrano solo il nome
// italiano, non l'id inglese usato come chiave in questa anagrafica).
export async function getDescrizioniByTipo(tipo: TipoTermineBgg): Promise<Map<string, string>> {
  const doc = await (await terminiColl()).find({ tipo, descrizione: { $exists: true, $ne: "" } }).toArray();
  const mappa = new Map<string, string>();
  for (const t of doc) {
    if (t.descrizione) mappa.set(t.nomeItaliano.toLowerCase(), t.descrizione);
  }
  return mappa;
}
