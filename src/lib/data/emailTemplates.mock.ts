import "server-only";
import { store } from "@/lib/mock/store";
import type { ChiaveEmail, ImpostazioniEmail, TemplateEmail } from "@/lib/types";

export async function getTemplateEmail(chiave: ChiaveEmail): Promise<TemplateEmail> {
  const trovato = store.templateEmail.find((t) => t.chiave === chiave);
  if (!trovato) throw new Error(`Template email "${chiave}" non trovato in anagrafica.`);
  return trovato;
}

export async function getTuttiITemplateEmail(): Promise<TemplateEmail[]> {
  return store.templateEmail;
}

export async function salvaTemplateEmail(chiave: ChiaveEmail, oggetto: string, corpo: string): Promise<void> {
  const template = store.templateEmail.find((t) => t.chiave === chiave);
  if (!template) return;
  template.oggetto = oggetto;
  template.corpo = corpo;
}

export async function getImpostazioniEmail(): Promise<ImpostazioniEmail> {
  return store.impostazioniEmail;
}

export async function salvaImpostazioniEmail(dati: ImpostazioniEmail): Promise<void> {
  store.impostazioniEmail = dati;
}
