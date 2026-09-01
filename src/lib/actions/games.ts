"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { creaGioco, type DatiNuovoGioco } from "@/lib/data/games";

export async function creaGiocoAction(formData: FormData) {
  await richiediAdmin();

  const dati: DatiNuovoGioco = {
    titolo: String(formData.get("titolo")),
    descrizione: String(formData.get("descrizione")),
    categorie: String(formData.get("categorie") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    giocatoriMin: Number(formData.get("giocatoriMin")),
    giocatoriMax: Number(formData.get("giocatoriMax")),
    durataMinutiMin: Number(formData.get("durataMinutiMin")),
    durataMinutiMax: Number(formData.get("durataMinutiMax")),
    etaMinima: Number(formData.get("etaMinima")),
    autore: String(formData.get("autore") ?? "") || undefined,
    editore: String(formData.get("editore") ?? "") || undefined,
    anno: formData.get("anno") ? Number(formData.get("anno")) : undefined,
    difficolta: Number(formData.get("difficolta") ?? 2) as DatiNuovoGioco["difficolta"],
  };

  await creaGioco(dati);
  revalidatePath("/");
  revalidatePath("/admin/giochi");
}
