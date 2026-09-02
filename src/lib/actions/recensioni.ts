"use server";

import { revalidatePath } from "next/cache";
import { richiediSocio } from "@/lib/session";
import { salvaRecensione } from "@/lib/data/recensioni";
import { getGiocoById } from "@/lib/data/games";

export async function salvaRecensioneAction(formData: FormData) {
  const socio = await richiediSocio();
  const giocoId = String(formData.get("giocoId"));

  const voto = Number(formData.get("voto"));
  if (!Number.isInteger(voto) || voto < 1 || voto > 10) {
    throw new Error("Il voto deve essere un numero intero tra 1 e 10.");
  }

  const commentoGrezzo = formData.get("commento");
  const commento = commentoGrezzo ? String(commentoGrezzo).trim().slice(0, 500) : null;

  await salvaRecensione(socio.id, giocoId, voto, commento || null);

  const gioco = await getGiocoById(giocoId);
  if (gioco) revalidatePath(`/giochi/${gioco.slug}`);
}
