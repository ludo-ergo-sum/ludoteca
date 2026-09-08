import "server-only";
import { Db, MongoClient, ObjectId } from "mongodb";

// Interruttore tra store mock (in memoria, src/lib/mock/) e MongoDB. true =
// mock (comportamento di sviluppo/demo, nessuna connessione qui aperta).
// Assente o false = MongoDB, tramite MONGODB_URI/DB_NAME.
export const DATA_MOCK = process.env.DATA_MOCK === "true";

// Cache su globalThis: sopravvive all'hot-reload di Turbopack in sviluppo e,
// in produzione su Vercel, evita di riaprire una connessione a ogni
// invocazione serverless "calda" (stesso trattamento di mock/store.ts).
const globalForMongo = globalThis as unknown as {
  __lesMongoClient?: Promise<MongoClient>;
  __lesMongoIndiciCreati?: boolean;
  __lesDb: Db;
};

// La connessione va aperta solo alla prima chiamata effettiva di getDb(), non
// al semplice import di questo modulo: ogni *.mongo.ts lo importa in modo
// statico anche quando DATA_MOCK e' true, quindi connettersi a livello di
// modulo farebbe crashare l'app in modalita' mock per MONGODB_URI assente.
function client(): Promise<MongoClient> {
  if (!globalForMongo.__lesMongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI non impostata (necessaria quando DATA_MOCK non e' true).");
    globalForMongo.__lesMongoClient = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 } ).connect();
  }
  return globalForMongo.__lesMongoClient;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.DB_NAME;
  if (!dbName) throw new Error("DB_NAME non impostata (necessaria quando DATA_MOCK non e' true).");
  if (globalForMongo.__lesDb) {
    return globalForMongo.__lesDb
  }
  globalForMongo.__lesDb = (await client()).db(dbName);
  if (!globalForMongo.__lesMongoIndiciCreati) {
    globalForMongo.__lesMongoIndiciCreati = true;
    await creaIndici(globalForMongo.__lesDb);
  }
  return globalForMongo.__lesDb;
}

async function creaIndici(db: Db): Promise<void> {
  await Promise.all([
    db.collection("giochi").createIndex({ slug: 1 }, { unique: true }),
    db.collection("giochi").createIndex({ bggId: 1 }, { unique: true, sparse: true }),
    // Catalogo pubblico paginato lato db (getGiochiCatalogo): sort per
    // titolo e filtro per categorie/meccaniche selezionate.
    db.collection("giochi").createIndex({ titolo: 1 }),
    db.collection("giochi").createIndex({ categorie: 1 }),
    db.collection("giochi").createIndex({ meccaniche: 1 }),
    db.collection("copie").createIndex({ codice: 1 }, { unique: true }),
    // conDisponibilita (in games.mongo.ts) conta le copie per gioco a ogni
    // pagina del catalogo: {giocoId} da solo usa comunque il prefisso di
    // questo indice composto.
    db.collection("copie").createIndex({ giocoId: 1, stato: 1 }),
    // getGiochiAdmin (senzaDisponibili/conSospese) fa distinct(giocoId)
    // filtrato per stato: qui serve stato come primo campo, il composto sopra
    // non basta perche' e' ordinato al contrario.
    db.collection("copie").createIndex({ stato: 1, giocoId: 1 }),
    db.collection("utenti").createIndex({ email: 1 }, { unique: true }),
    db.collection("utenti").createIndex({ googleId: 1 }, { unique: true, sparse: true }),
    // getSocieAdmin/contaSocieNonInRegola (tab Tutte/Da-rinnovare/In-regola
    // di /admin/socie) filtrano con $elemMatch su quote.anno+quote.inRegola.
    db.collection("utenti").createIndex({ "quote.anno": 1, "quote.inRegola": 1 }),
    db.collection("terminiBgg").createIndex({ tipo: 1, nomeInglese: 1 }, { unique: true }),
    // getTerminiAdmin (tab da-tradurre/tradotte + filtro con/senza
    // descrizione di /admin/traduzioni), oltre alla chiave naturale sopra.
    db.collection("terminiBgg").createIndex({ tipo: 1, daRitradurre: 1 }),
    db.collection("templateEmail").createIndex({ chiave: 1 }, { unique: true }),
    // getPrestitiConclusi ("Storico completo" di /admin/prestiti, paginato).
    db.collection("prestiti").createIndex({ stato: 1, dataRichiesta: -1 }),
    // getRichiesteGestite ("Storico" di /admin/richieste-acquisto, paginato).
    db.collection("richiesteAcquisto").createIndex({ stato: 1, data: -1 }),
    // Invariante gia' descritto in loans.ts: al massimo un prestito
    // attivo/in attesa per copia. In mock lo garantisce un controllo
    // sincrono, qui un indice unico parziale — due richieste concorrenti
    // sulla stessa copia falliscono con un duplicate key (codice 11000).
    db.collection("prestiti").createIndex(
      { copiaId: 1 },
      { unique: true, partialFilterExpression: { stato: { $in: ["in_attesa", "approvato", "in_corso"] } } }
    ),
  ]);
}

// Un id costruito da input utente (es. un parametro di rotta) puo' non
// essere un ObjectId valido: null, non un throw, cosi' i chiamanti lo
// trattano come "nessun match" invece di un errore 500.
export function idFiltro(id: string): { _id: ObjectId } | null {
  if (!ObjectId.isValid(id)) return null;
  return { _id: new ObjectId(id) };
}

// Rimappa _id: ObjectId -> id: string (hex): fuori da lib/data e da questo
// file, nessun altro modulo deve sapere che esiste un ObjectId.
export function daDocumento<T extends { _id: ObjectId }>(doc: T): Omit<T, "_id"> & { id: string } {
  const { _id, ...resto } = doc;
  return { id: _id.toHexString(), ...(resto as Omit<T, "_id">) };
}
