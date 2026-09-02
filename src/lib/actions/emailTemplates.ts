"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { salvaImpostazioniEmail, salvaTemplateEmail } from "@/lib/data/emailTemplates";
import type { ChiaveEmail } from "@/lib/types";

export async function salvaTemplateEmailAction(formData: FormData) {
  await richiediAdmin();
  const chiave = String(formData.get("chiave")) as ChiaveEmail;
  const oggetto = String(formData.get("oggetto"));
  const corpo = String(formData.get("corpo"));

  await salvaTemplateEmail(chiave, oggetto, corpo);
  revalidatePath("/admin/email");
}

export async function salvaImpostazioniEmailAction(formData: FormData) {
  await richiediAdmin();
  const intestazione = String(formData.get("intestazione"));
  const piePagina = String(formData.get("piePagina"));

  await salvaImpostazioniEmail({ intestazione, piePagina });
  revalidatePath("/admin/email");
}
