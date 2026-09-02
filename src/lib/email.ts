import "server-only";
import { Resend } from "resend";
import { getImpostazioniEmail, getTemplateEmail } from "@/lib/data/emailTemplates";
import type { ChiaveEmail } from "@/lib/types";

// Invio email best-effort: un problema con Resend non deve mai far fallire
// l'azione principale (creare un socio, registrare un prestito, ecc.), quindi
// si logga e si prosegue invece di lanciare un'eccezione. Stesso approccio di
// src/lib/deepl.ts.

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MITTENTE = process.env.EMAIL_FROM ?? "Ludo Ergo Sum <onboarding@resend.dev>";

async function inviaEmail(a: { to: string | string[]; subject: string; html: string }): Promise<void> {
  if (!resend) return;
  try {
    await resend.emails.send({ from: MITTENTE, to: a.to, subject: a.subject, html: a.html });
  } catch (errore) {
    console.error("Invio email non riuscito, proseguo comunque.", errore);
  }
}

// Oggetto/corpo sono testo semplice modificabile dalla segreteria in
// /admin/email: i placeholder {{chiave}} vanno sostituiti PRIMA di fare
// l'escape, cosi' sia il testo scritto a mano sia i valori dinamici (che
// includono input di socie/i, es. il commento di una richiesta d'acquisto)
// finiscono sempre trattati come testo, mai come markup HTML.
function sostituisci(testo: string, valori: Record<string, string>): string {
  return testo.replace(/\{\{(\w+)\}\}/g, (originale, chiave) => valori[chiave] ?? originale);
}

function escapeHtml(testo: string): string {
  return testo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Riga vuota = nuovo paragrafo; un a-capo singolo resta nello stesso
// paragrafo. Paragrafi vuoti (es. un placeholder facoltativo assente) vengono
// scartati invece di produrre un <p></p> vuoto.
function paragrafi(testo: string): string {
  return testo
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

async function componiEmail(
  chiave: ChiaveEmail,
  valori: Record<string, string>
): Promise<{ subject: string; html: string }> {
  const [template, impostazioni] = await Promise.all([getTemplateEmail(chiave), getImpostazioniEmail()]);
  const html = [
    paragrafi(sostituisci(impostazioni.intestazione, valori)),
    paragrafi(sostituisci(template.corpo, valori)),
    paragrafi(sostituisci(impostazioni.piePagina, valori)),
  ]
    .filter(Boolean)
    .join("\n");
  return { subject: sostituisci(template.oggetto, valori), html };
}

export async function inviaEmailBenvenuto(utente: { email: string; nome: string }): Promise<void> {
  const { subject, html } = await componiEmail("benvenuto", { nome: utente.nome });
  await inviaEmail({ to: utente.email, subject, html });
}

export async function inviaEmailNuovaRichiesta(
  adminEmails: string[],
  dati: { giocoTitolo: string; socioNome: string }
): Promise<void> {
  if (adminEmails.length === 0) return;
  const { subject, html } = await componiEmail("nuovaRichiesta", dati);
  await inviaEmail({ to: adminEmails, subject, html });
}

export async function inviaEmailNuovaRichiestaAcquisto(
  adminEmails: string[],
  dati: { giocoBaseTitolo: string; espansioneTitolo: string; socioNome: string; messaggio?: string | null }
): Promise<void> {
  if (adminEmails.length === 0) return;
  const { subject, html } = await componiEmail("nuovaRichiestaAcquisto", {
    giocoBaseTitolo: dati.giocoBaseTitolo,
    espansioneTitolo: dati.espansioneTitolo,
    socioNome: dati.socioNome,
    messaggio: dati.messaggio ?? "",
  });
  await inviaEmail({ to: adminEmails, subject, html });
}

export async function inviaEmailDecisionePrestito(
  utente: { email: string; nome: string },
  dati: { giocoTitolo: string; approvato: boolean; note?: string }
): Promise<void> {
  const { subject, html } = await componiEmail("decisionePrestito", {
    nome: utente.nome,
    giocoTitolo: dati.giocoTitolo,
    risultato: dati.approvato ? "approvata" : "rifiutata",
    esito: dati.approvato ? "approvata: vieni a ritirarla in ludoteca" : "rifiutata",
    nota: dati.note ? `Nota della segreteria: ${dati.note}` : "",
  });
  await inviaEmail({ to: utente.email, subject, html });
}

export async function inviaEmailPromemoria(
  utente: { email: string; nome: string },
  dati: { giocoTitolo: string; dataScadenza: string }
): Promise<void> {
  const { subject, html } = await componiEmail("promemoria", {
    nome: utente.nome,
    giocoTitolo: dati.giocoTitolo,
    dataScadenza: dati.dataScadenza,
  });
  await inviaEmail({ to: utente.email, subject, html });
}
