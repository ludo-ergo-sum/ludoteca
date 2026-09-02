import "server-only";
import { Resend } from "resend";

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

export async function inviaEmailBenvenuto(utente: { email: string; nome: string }): Promise<void> {
  await inviaEmail({
    to: utente.email,
    subject: "Benvenuto in Ludo Ergo Sum",
    html: `
      <p>Ciao ${utente.nome},</p>
      <p>Benvenuto/a in Ludo Ergo Sum! Da ora puoi sfogliare il catalogo e richiedere in prestito i giochi disponibili in ludoteca.</p>
      <p>A presto in via Foce 40.</p>
    `,
  });
}

export async function inviaEmailNuovaRichiesta(
  adminEmails: string[],
  dati: { giocoTitolo: string; socioNome: string }
): Promise<void> {
  if (adminEmails.length === 0) return;
  await inviaEmail({
    to: adminEmails,
    subject: `Nuova richiesta di prestito: ${dati.giocoTitolo}`,
    html: `
      <p>${dati.socioNome} ha richiesto in prestito <strong>${dati.giocoTitolo}</strong>.</p>
      <p>Vai su /admin/prestiti per approvare o rifiutare la richiesta.</p>
    `,
  });
}

export async function inviaEmailNuovaRichiestaAcquisto(
  adminEmails: string[],
  dati: { giocoBaseTitolo: string; espansioneTitolo: string; socioNome: string; messaggio?: string | null }
): Promise<void> {
  if (adminEmails.length === 0) return;
  await inviaEmail({
    to: adminEmails,
    subject: `Richiesta d'acquisto: ${dati.espansioneTitolo}`,
    html: `
      <p>${dati.socioNome} ha segnalato <strong>${dati.espansioneTitolo}</strong> (espansione di ${dati.giocoBaseTitolo}) come non presente in catalogo.</p>
      ${dati.messaggio ? `<p>Messaggio: ${dati.messaggio}</p>` : ""}
      <p>Vai su /admin/richieste-acquisto per gestire la richiesta.</p>
    `,
  });
}

export async function inviaEmailDecisionePrestito(
  utente: { email: string; nome: string },
  dati: { giocoTitolo: string; approvato: boolean; note?: string }
): Promise<void> {
  await inviaEmail({
    to: utente.email,
    subject: dati.approvato
      ? `Richiesta approvata: ${dati.giocoTitolo}`
      : `Richiesta rifiutata: ${dati.giocoTitolo}`,
    html: `
      <p>Ciao ${utente.nome},</p>
      <p>La tua richiesta per <strong>${dati.giocoTitolo}</strong> e' stata ${
      dati.approvato ? "approvata: vieni a ritirarla in ludoteca" : "rifiutata"
    }.</p>
      ${dati.note ? `<p>Nota della segreteria: ${dati.note}</p>` : ""}
    `,
  });
}

export async function inviaEmailPromemoria(
  utente: { email: string; nome: string },
  dati: { giocoTitolo: string; dataScadenza: string }
): Promise<void> {
  await inviaEmail({
    to: utente.email,
    subject: `Promemoria: restituzione di ${dati.giocoTitolo}`,
    html: `
      <p>Ciao ${utente.nome},</p>
      <p>Il prestito di <strong>${dati.giocoTitolo}</strong> scade il ${dati.dataScadenza}. Ricordati di riportarlo in ludoteca.</p>
    `,
  });
}
