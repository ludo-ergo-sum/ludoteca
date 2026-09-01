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
import { socioInRegolaPerAnno } from "@/lib/data/users";

export async function richiediPrestitoAction(formData: FormData) {
  const socio = await richiediSocio();
  const copiaId = String(formData.get("copiaId"));

  const copia = await getCopiaById(copiaId);
  if (!copia) throw new Error("Copia non trovata.");
  if (copia.stato !== "disponibile") throw new Error("Questa copia non e' disponibile.");

  const annoCorrente = new Date().getFullYear();
  if (!socioInRegolaPerAnno(socio, annoCorrente)) {
    throw new Error("La quota associativa non risulta in regola per l'anno in corso: contatta la segreteria.");
  }

  await richiediPrestito(copia.id, copia.giocoId, socio.id);

  const gioco = await getGiocoById(copia.giocoId);
  if (gioco) revalidatePath(`/giochi/${gioco.slug}`);
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
