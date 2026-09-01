"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { aggiornaNoteAdmin, creaCopia, impostaStatoCopia } from "@/lib/data/copies";
import { getGiocoById } from "@/lib/data/games";

async function revalidaGioco(giocoId: string) {
  const gioco = await getGiocoById(giocoId);
  if (gioco) revalidatePath(`/giochi/${gioco.slug}`);
  revalidatePath("/admin/giochi");
}

export async function creaCopiaAction(formData: FormData) {
  await richiediAdmin();
  const giocoId = String(formData.get("giocoId"));
  const prefisso = String(formData.get("prefisso")).toUpperCase();

  await creaCopia(giocoId, prefisso);
  await revalidaGioco(giocoId);
}

export async function mettiOfflineAction(formData: FormData) {
  await richiediAdmin();
  const copiaId = String(formData.get("copiaId"));
  const motivo = String(formData.get("motivoOffline") ?? "");

  const copia = await impostaStatoCopia(copiaId, "offline", { motivoOffline: motivo });
  if (!copia) throw new Error("Copia non trovata.");

  await revalidaGioco(copia.giocoId);
  revalidatePath(`/copie/${copia.codice}`);
}

export async function rimettiOnlineAction(formData: FormData) {
  await richiediAdmin();
  const copiaId = String(formData.get("copiaId"));

  const copia = await impostaStatoCopia(copiaId, "disponibile");
  if (!copia) throw new Error("Copia non trovata.");

  await revalidaGioco(copia.giocoId);
  revalidatePath(`/copie/${copia.codice}`);
}

export async function aggiornaNoteAdminAction(formData: FormData) {
  await richiediAdmin();
  const copiaId = String(formData.get("copiaId"));
  const note = String(formData.get("noteAdmin") ?? "");

  const copia = await aggiornaNoteAdmin(copiaId, note);
  if (!copia) throw new Error("Copia non trovata.");

  await revalidaGioco(copia.giocoId);
}

export async function rimuoviNoteAdminAction(formData: FormData) {
  await richiediAdmin();
  const copiaId = String(formData.get("copiaId"));

  const copia = await aggiornaNoteAdmin(copiaId, "");
  if (!copia) throw new Error("Copia non trovata.");

  await revalidaGioco(copia.giocoId);
}
