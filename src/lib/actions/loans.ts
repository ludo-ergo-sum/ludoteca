"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin, richiediSocio } from "@/lib/session";
import { getCopiaById, impostaStatoCopia } from "@/lib/data/copies";
import {
  annullaPrestito,
  decidiPrestito,
  registraRientro,
  richiediPrestito,
} from "@/lib/data/loans";
import { getGiocoById } from "@/lib/data/games";
import { ADMIN_EMAILS, getUtenteById, socioInRegolaPerAnno } from "@/lib/data/users";
import { inviaEmailDecisionePrestito, inviaEmailNuovaRichiesta } from "@/lib/email";

export async function richiediPrestitoAction(formData: FormData) {
  const socio = await richiediSocio();
  const copiaId = String(formData.get("copiaId"));

  const copia = await getCopiaById(copiaId);
  if (!copia) throw new Error("Copia non trovata.");

  const annoCorrente = new Date().getFullYear();
  if (!socioInRegolaPerAnno(socio, annoCorrente)) {
    throw new Error("La quota associativa non risulta in regola per l'anno in corso: contatta la segreteria.");
  }

  // Verifica di disponibilita' ripetuta qui (non solo a monte, quando la
  // pagina e' stata renderizzata): tra il caricamento della pagina e il
  // click qualcun altro potrebbe aver richiesto la stessa copia.
  const prestito = await richiediPrestito(copia.id, copia.giocoId, socio.id);
  if (!prestito) {
    throw new Error("Questa copia non e' piu' disponibile: qualcun altro l'ha appena richiesta.");
  }

  const gioco = await getGiocoById(copia.giocoId);
  if (gioco) {
    revalidatePath(`/giochi/${gioco.slug}`);
    await inviaEmailNuovaRichiesta(ADMIN_EMAILS, { giocoTitolo: gioco.titolo, socioNome: socio.nome });
  }
  revalidatePath(`/copie/${copia.codice}`);
  revalidatePath("/profilo");
  revalidatePath("/admin/prestiti");
}

export async function annullaPrestitoAction(formData: FormData) {
  const socio = await richiediSocio();
  const prestitoId = String(formData.get("prestitoId"));
  const prestito = await annullaPrestito(prestitoId);
  if (prestito && prestito.utenteId !== socio.id) {
    throw new Error("Non puoi annullare una richiesta di un altro socio.");
  }
  revalidatePath("/profilo");
  revalidatePath("/admin/prestiti");
}

export async function decidiPrestitoAction(formData: FormData) {
  const admin = await richiediAdmin();
  const prestitoId = String(formData.get("prestitoId"));
  const approva = formData.get("decisione") === "approva";
  const note = formData.get("note");

  const prestito = await decidiPrestito(prestitoId, approva, admin.nome, note ? String(note) : undefined);
  if (!prestito) throw new Error("Richiesta non trovata.");

  if (approva) {
    await impostaStatoCopia(prestito.copiaId, "in_prestito");
  }

  const [gioco, socio] = await Promise.all([getGiocoById(prestito.giocoId), getUtenteById(prestito.utenteId)]);
  if (gioco && socio) {
    await inviaEmailDecisionePrestito(socio, { giocoTitolo: gioco.titolo, approvato: approva, note: prestito.note ?? undefined });
  }

  revalidatePath("/admin/prestiti");
  revalidatePath("/profilo");
}

export async function registraRientroAction(formData: FormData) {
  const admin = await richiediAdmin();
  const prestitoId = String(formData.get("prestitoId"));

  const prestito = await registraRientro(prestitoId, admin.nome);
  if (!prestito) throw new Error("Prestito non trovato.");

  await impostaStatoCopia(prestito.copiaId, "disponibile");

  const copia = await getCopiaById(prestito.copiaId);
  revalidatePath("/admin/prestiti");
  revalidatePath("/profilo");
  if (copia) revalidatePath(`/copie/${copia.codice}`);
}
