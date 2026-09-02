"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { impostaQuotaAnnuale, impostaRuolo } from "@/lib/data/users";
import type { Ruolo } from "@/lib/types";

export async function impostaRuoloAction(formData: FormData) {
  const admin = await richiediAdmin();
  const utenteId = String(formData.get("utenteId"));
  const ruolo = String(formData.get("ruolo")) as Ruolo;

  if (utenteId === admin.id) {
    throw new Error("Non puoi cambiare il ruolo del tuo stesso account.");
  }

  await impostaRuolo(utenteId, ruolo);

  revalidatePath("/admin/socie");
  revalidatePath("/profilo");
}

export async function impostaQuotaAction(formData: FormData) {
  const admin = await richiediAdmin();
  const utenteId = String(formData.get("utenteId"));
  const anno = Number(formData.get("anno"));
  const inRegola = formData.get("inRegola") === "on";
  const note = formData.get("note");

  await impostaQuotaAnnuale(utenteId, anno, inRegola, admin.nome, note ? String(note) : undefined);

  revalidatePath("/admin/socie");
  revalidatePath("/profilo");
}
