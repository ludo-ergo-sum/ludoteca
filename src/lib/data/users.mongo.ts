import "server-only";
import { daDocumento, getDb, idFiltro } from "@/lib/mongo";
import type { QuotaAnnuale, Ruolo, Utente } from "@/lib/types";

type UtenteDoc = Omit<Utente, "id">;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "admin@ludoergosum.it")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function utentiColl() {
  return getDb().then((db) => db.collection<UtenteDoc>("utenti"));
}

function escapeRegExp(testo: string): string {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getUtenteById(id: string): Promise<Utente | null> {
  const filtro = idFiltro(id);
  if (!filtro) return null;
  const doc = await (await utentiColl()).findOne(filtro);
  return doc ? daDocumento(doc) : null;
}

export async function getUtenteByEmail(email: string): Promise<Utente | null> {
  const doc = await (await utentiColl()).findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: "i" } });
  return doc ? daDocumento(doc) : null;
}

export async function getSocie(): Promise<Utente[]> {
  const doc = await (await utentiColl()).find().toArray();
  return doc.map(daDocumento);
}

// Chiamata dal callback di NextAuth al primo login: crea il socio se non
// esiste ancora, cosi' l'iscrizione avviene semplicemente accedendo con
// Google la prima volta.
export async function trovaOCreaUtenteDaGoogle(profilo: {
  googleId: string;
  nome: string;
  email: string;
  immagine?: string | null;
}): Promise<{ utente: Utente; creato: boolean }> {
  const coll = await utentiColl();
  const esistente = await coll.findOne({ $or: [{ googleId: profilo.googleId }, { email: profilo.email }] });
  if (esistente) {
    const aggiornato = await coll.findOneAndUpdate(
      { _id: esistente._id },
      { $set: { nome: profilo.nome, immagine: profilo.immagine ?? esistente.immagine } },
      { returnDocument: "after" }
    );
    return { utente: daDocumento(aggiornato!), creato: false };
  }

  const ruolo: Ruolo = ADMIN_EMAILS.includes(profilo.email.toLowerCase()) ? "admin" : "socio";
  const doc: UtenteDoc = {
    googleId: profilo.googleId,
    nome: profilo.nome,
    email: profilo.email,
    immagine: profilo.immagine ?? null,
    ruolo,
    dataIscrizione: new Date().toISOString().slice(0, 10),
    quote: [],
  };
  const risultato = await coll.insertOne(doc);
  return { utente: daDocumento({ ...doc, _id: risultato.insertedId }), creato: true };
}

export async function impostaRuolo(utenteId: string, ruolo: Ruolo): Promise<Utente | null> {
  const filtro = idFiltro(utenteId);
  if (!filtro) return null;
  const doc = await (await utentiColl()).findOneAndUpdate(filtro, { $set: { ruolo } }, { returnDocument: "after" });
  return doc ? daDocumento(doc) : null;
}

// Elimina anche preferiti/recensioni/richieste d'acquisto del socio (altrimenti
// resterebbero orfani). Lo storico prestiti resta invece intatto (stesso
// approccio di eliminaGioco in games.ts): la pagina admin/prestiti mostra
// gia' un nome vuoto per un socio assente, senza errori. Il controllo "nessun
// prestito attivo" e' responsabilita' del chiamante (vedi eliminaSocioAction).
export async function eliminaSocio(utenteId: string): Promise<boolean> {
  const filtro = idFiltro(utenteId);
  if (!filtro) return false;
  const db = await getDb();
  const risultato = await db.collection<UtenteDoc>("utenti").deleteOne(filtro);
  if (risultato.deletedCount === 0) return false;
  await Promise.all([
    db.collection("preferiti").deleteMany({ utenteId }),
    db.collection("recensioni").deleteMany({ utenteId }),
    db.collection("richiesteAcquisto").deleteMany({ utenteId }),
  ]);
  return true;
}

export async function impostaQuotaAnnuale(
  utenteId: string,
  anno: number,
  inRegola: boolean,
  registratoDa: string,
  note?: string
): Promise<Utente | null> {
  const filtro = idFiltro(utenteId);
  if (!filtro) return null;
  const coll = await utentiColl();
  const utente = await coll.findOne(filtro);
  if (!utente) return null;

  const quota: QuotaAnnuale = {
    anno,
    inRegola,
    dataRegistrazione: inRegola ? new Date().toISOString().slice(0, 10) : null,
    registratoDa,
    note,
  };

  const quote = [...utente.quote];
  const esistenteIndex = quote.findIndex((q) => q.anno === anno);
  if (esistenteIndex >= 0) {
    quote[esistenteIndex] = quota;
  } else {
    quote.push(quota);
    quote.sort((a, b) => a.anno - b.anno);
  }

  const doc = await coll.findOneAndUpdate(filtro, { $set: { quote } }, { returnDocument: "after" });
  return doc ? daDocumento(doc) : null;
}
