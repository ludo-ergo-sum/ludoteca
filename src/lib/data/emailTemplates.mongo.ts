import "server-only";
import { MongoServerError } from "mongodb";
import { getDb } from "@/lib/mongo";
import { impostazioniEmailSeed, templateEmailSeed } from "@/lib/mock/seed";
import type { ChiaveEmail, ImpostazioniEmail, TemplateEmail } from "@/lib/types";

const ID_IMPOSTAZIONI = "impostazioni";

function templateColl() {
  return getDb().then((db) => db.collection<TemplateEmail>("templateEmail"));
}
function impostazioniColl() {
  return getDb().then((db) => db.collection<ImpostazioniEmail & { _id: string }>("impostazioniEmail"));
}

// I 5 template e l'intestazione/piè di pagina sono configurazione di base,
// non dati di prova: senza di loro l'app non può comporre nessuna email.
// Si inseriscono una sola volta, al primo utilizzo su un database vuoto —
// stesso testo di default che il seed mock usa da sempre.
let templatePredefinitiVerificati = false;
async function assicuraTemplatePredefiniti(): Promise<void> {
  if (templatePredefinitiVerificati) return;
  templatePredefinitiVerificati = true;
  const coll = await templateColl();
  if ((await coll.countDocuments()) === 0) {
    // countDocuments-poi-insert non e' atomico: sul primissimo avvio, due
    // richieste quasi simultanee potrebbero passare entrambe il controllo.
    // L'indice unico su chiave (vedi lib/mongo.ts) fa fallire la seconda
    // insertMany con un duplicate key, che qui si ignora (i default sono
    // gia' stati scritti dalla prima).
    try {
      await coll.insertMany(templateEmailSeed);
    } catch (errore) {
      if (!(errore instanceof MongoServerError && errore.code === 11000)) throw errore;
    }
  }
}

let impostazioniPredefiniteVerificate = false;
async function assicuraImpostazioniPredefinite(): Promise<void> {
  if (impostazioniPredefiniteVerificate) return;
  impostazioniPredefiniteVerificate = true;
  const coll = await impostazioniColl();
  if (!(await coll.findOne({ _id: ID_IMPOSTAZIONI }))) {
    try {
      await coll.insertOne({ _id: ID_IMPOSTAZIONI, ...impostazioniEmailSeed });
    } catch (errore) {
      if (!(errore instanceof MongoServerError && errore.code === 11000)) throw errore;
    }
  }
}

export async function getTemplateEmail(chiave: ChiaveEmail): Promise<TemplateEmail> {
  await assicuraTemplatePredefiniti();
  const doc = await (await templateColl()).findOne({ chiave });
  if (!doc) throw new Error(`Template email "${chiave}" non trovato in anagrafica.`);
  const { _id, ...template } = doc;
  return template;
}

export async function getTuttiITemplateEmail(): Promise<TemplateEmail[]> {
  await assicuraTemplatePredefiniti();
  const doc = await (await templateColl()).find().toArray();
  return doc.map(({ _id, ...template }) => template);
}

export async function salvaTemplateEmail(chiave: ChiaveEmail, oggetto: string, corpo: string): Promise<void> {
  await assicuraTemplatePredefiniti();
  await (await templateColl()).updateOne({ chiave }, { $set: { oggetto, corpo } });
}

export async function getImpostazioniEmail(): Promise<ImpostazioniEmail> {
  await assicuraImpostazioniPredefinite();
  const doc = await (await impostazioniColl()).findOne({ _id: ID_IMPOSTAZIONI });
  const { _id, ...impostazioni } = doc!;
  return impostazioni;
}

export async function salvaImpostazioniEmail(dati: ImpostazioniEmail): Promise<void> {
  await assicuraImpostazioniPredefinite();
  await (await impostazioniColl()).updateOne({ _id: ID_IMPOSTAZIONI }, { $set: dati });
}
