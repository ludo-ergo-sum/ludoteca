"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { impostaQuotaAnnuale } from "@/lib/data/users";

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
