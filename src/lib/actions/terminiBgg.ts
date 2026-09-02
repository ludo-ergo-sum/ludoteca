"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { aggiornaTraduzioneTermine } from "@/lib/data/terminiBgg";
import type { TipoTermineBgg } from "@/lib/types";

export async function aggiornaTraduzioneTermineAction(formData: FormData) {
  await richiediAdmin();
  const tipo = String(formData.get("tipo")) as TipoTermineBgg;
  const nomeInglese = String(formData.get("nomeInglese"));
  const nomeItaliano = String(formData.get("nomeItaliano"));
  const descrizioneGrezza = formData.get("descrizione");
  const descrizione = descrizioneGrezza ? String(descrizioneGrezza).trim().slice(0, 300) : undefined;

  await aggiornaTraduzioneTermine(tipo, nomeInglese, nomeItaliano, descrizione);

  revalidatePath("/admin/traduzioni");
  revalidatePath("/");
}
