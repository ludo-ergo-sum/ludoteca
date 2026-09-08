import "server-only";
import type { Filter } from "mongodb";
import { daDocumento, getDb, idFiltro } from "@/lib/mongo";
import type { Gioco, GiocoConDisponibilita } from "@/lib/types";
import type { DatiGiocoBgg, DatiModificaGioco, DatiNuovoGioco, FiltriCatalogo, PaginaCatalogo } from "./games";

function escapeRegExp(testo: string): string {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type GiocoDoc = Omit<Gioco, "id">;

function giochiColl() {
  return getDb().then((db) => db.collection<GiocoDoc>("giochi"));
}
function copieColl() {
  return getDb().then((db) => db.collection("copie"));
}

async function conDisponibilita(gioco: Gioco): Promise<GiocoConDisponibilita> {
  const copie = copieColl();
  const [copieTotali, copieDisponibili] = await Promise.all([
    (await copie).countDocuments({ giocoId: gioco.id }),
    (await copie).countDocuments({ giocoId: gioco.id, stato: "disponibile" }),
  ]);
  return { ...gioco, copieTotali, copieDisponibili };
}

export async function getGiochi(): Promise<GiocoConDisponibilita[]> {
  const giochi = (await (await giochiColl()).find().toArray()).map(daDocumento);
  return Promise.all(giochi.map(conDisponibilita));
}

// Solo i totali per la home: 3 countDocuments invece di caricare tutti i
// giochi e tutte le copie in memoria per poi farne .length.
export async function getStatisticheCatalogo(): Promise<{
  totaleGiochi: number;
  copieTotali: number;
  copieDisponibili: number;
}> {
  const [totaleGiochi, copieTotali, copieDisponibili] = await Promise.all([
    (await giochiColl()).countDocuments(),
    (await copieColl()).countDocuments(),
    (await copieColl()).countDocuments({ stato: "disponibile" }),
  ]);
  return { totaleGiochi, copieTotali, copieDisponibili };
}

// Catalogo pubblico paginato lato db: find() con skip/limit invece di
// caricare tutta la collezione e scorrerla in memoria.
export async function getGiochiCatalogo(filtri: FiltriCatalogo): Promise<PaginaCatalogo> {
  const query: Filter<GiocoDoc> = {};
  const ricerca = filtri.ricerca?.trim();
  if (ricerca) {
    query.titolo = { $regex: escapeRegExp(ricerca), $options: "i" };
  }
  if (filtri.categorie?.length) {
    query.categorie = { $in: filtri.categorie };
  }
  if (filtri.meccaniche?.length) {
    query.meccaniche = { $in: filtri.meccaniche };
  }

  const coll = await giochiColl();
  const salto = (filtri.pagina - 1) * filtri.perPagina;
  const [docs, totale] = await Promise.all([
    coll.find(query).sort({ titolo: 1 }).skip(salto).limit(filtri.perPagina).toArray(),
    coll.countDocuments(query),
  ]);
  const giochi = await Promise.all(docs.map(daDocumento).map(conDisponibilita));
  return { giochi, totale };
}

// Opzioni per i filtri a tendina (categorie/meccaniche): distinct() su tutta
// la collezione, indipendente dalla pagina corrente, cosi' l'elenco delle
// opzioni non si restringe man mano che si scorre o si filtra.
export async function getOpzioniFiltroCatalogo(): Promise<{ categorie: string[]; meccaniche: string[] }> {
  const coll = await giochiColl();
  const [categorie, meccaniche] = await Promise.all([
    coll.distinct("categorie"),
    coll.distinct("meccaniche"),
  ]);
  return {
    categorie: (categorie as string[]).sort((a, b) => a.localeCompare(b)),
    meccaniche: (meccaniche as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b)),
  };
}

export async function getGiocoBySlug(slug: string): Promise<GiocoConDisponibilita | null> {
  const doc = await (await giochiColl()).findOne({ slug });
  return doc ? conDisponibilita(daDocumento(doc)) : null;
}

export async function getGiocoById(id: string): Promise<Gioco | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const doc = await (await giochiColl()).findOne(filtro);
  return doc ? daDocumento(doc) : null;
}

export async function getGiocoByBggId(bggId: number): Promise<Gioco | null> {
  const doc = await (await giochiColl()).findOne({ bggId });
  return doc ? daDocumento(doc) : null;
}

// Elimina anche le copie del gioco (altrimenti resterebbero orfane). Lo
// storico prestiti che referenzia queste copie/questo gioco resta invece
// intatto: gia' gestisce gioco/copia assenti (vedi PrestitoConDettagli).
// Se il gioco proviene da BGG, la prossima sync lo ricrea da capo.
export async function eliminaGioco(id: string): Promise<boolean> {
  const filtro = idFiltro(id);
  if (!filtro) return false;
  const risultato = await (await giochiColl()).deleteOne(filtro);
  if (risultato.deletedCount === 0) return false;
  await (await copieColl()).deleteMany({ giocoId: id });
  return true;
}

function slugifica(titolo: string): string {
  return titolo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Il form manuale ha un campo di testo unico per autore/editore: qui si
// converte nell'array che il modello dati usa uniformemente (coerente con
// cio' che arriva dalla sync BGG, che puo' avere piu' di un nome).
export async function creaGioco(dati: DatiNuovoGioco): Promise<Gioco> {
  const { autore, editore, ...resto } = dati;
  const doc: GiocoDoc = {
    slug: slugifica(dati.titolo),
    immagine: "",
    bggId: null,
    ...resto,
    autore: autore ? [autore] : undefined,
    editore: editore ? [editore] : undefined,
  };
  const risultato = await (await giochiColl()).insertOne(doc);
  return daDocumento({ ...doc, _id: risultato.insertedId });
}

// Form di modifica in /admin/giochi/[id]: a differenza di creaGioco, qui si
// modifica un gioco che puo' provenire dalla sync BGG, quindi bisogna anche
// decidere se la sync deve poter tornare a sovrascriverlo (permettiSyncBgg).
export async function aggiornaGioco(
  id: string,
  dati: DatiModificaGioco,
  permettiSyncBgg: boolean
): Promise<Gioco | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const doc = await (await giochiColl()).findOneAndUpdate(
    filtro,
    { $set: { ...dati, bggSyncBloccata: !permettiSyncBgg } },
    { returnDocument: "after" }
  );
  return doc ? daDocumento(doc) : null;
}

// Sync one-way dal catalogo master su BoardGameGeek: se esiste gia' un gioco
// con questo bggId ne aggiorna i dati (senza toccare id/slug, per non rompere
// QR/copie/URL gia' in circolazione), altrimenti lo crea.
export async function sincronizzaGiocoDaBgg(
  dati: DatiGiocoBgg
): Promise<{ gioco: Gioco; creato: boolean }> {
  const coll = await giochiColl();
  const esistente = await coll.findOne({ bggId: dati.bggId });
  if (esistente) {
    // Rete di sicurezza oltre al filtro fatto a monte in syncBgg.ts: un
    // admin ha modificato questo gioco a mano, la sync non lo tocca piu'.
    if (esistente.bggSyncBloccata) return { gioco: daDocumento(esistente), creato: false };
    const aggiornato = await coll.findOneAndUpdate(
      { _id: esistente._id },
      { $set: dati },
      { returnDocument: "after" }
    );
    return { gioco: daDocumento(aggiornato!), creato: false };
  }

  const doc: GiocoDoc = { slug: slugifica(dati.titolo), ...dati, dataImportazioneBgg: new Date().toISOString().slice(0, 10) };
  const risultato = await coll.insertOne(doc);
  return { gioco: daDocumento({ ...doc, _id: risultato.insertedId }), creato: true };
}
