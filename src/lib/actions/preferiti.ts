"use server";

import { revalidatePath } from "next/cache";
import { richiediSocio } from "@/lib/session";
import { toggleFavorito } from "@/lib/data/preferiti";
import { getGiocoById } from "@/lib/data/games";

export async function toggleFavoritoAction(formData: FormData) {
  const socio = await richiediSocio();
  const giocoId = String(formData.get("giocoId"));

  await toggleFavorito(socio.id, giocoId);

  const gioco = await getGiocoById(giocoId);
  if (gioco) revalidatePath(`/giochi/${gioco.slug}`);
  revalidatePath("/profilo");
}
