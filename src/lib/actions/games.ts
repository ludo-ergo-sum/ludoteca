"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { aggiornaGioco, creaGioco, eliminaGioco, type DatiModificaGioco, type DatiNuovoGioco } from "@/lib/data/games";

function listaOpzionale(valore: FormDataEntryValue | null): string[] | undefined {
  const elenco = String(valore ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return elenco.length > 0 ? elenco : undefined;
}

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

export async function aggiornaGiocoAction(formData: FormData) {
  await richiediAdmin();
  const id = String(formData.get("id"));

  const dati: DatiModificaGioco = {
    titolo: String(formData.get("titolo")),
    descrizione: String(formData.get("descrizione")),
    immagine: String(formData.get("immagine") ?? ""),
    miniatura: String(formData.get("miniatura") ?? "") || undefined,
    categorie: listaOpzionale(formData.get("categorie")) ?? [],
    meccaniche: listaOpzionale(formData.get("meccaniche")),
    giocatoriMin: Number(formData.get("giocatoriMin")),
    giocatoriMax: Number(formData.get("giocatoriMax")),
    durataMinutiMin: Number(formData.get("durataMinutiMin")),
    durataMinutiMax: Number(formData.get("durataMinutiMax")),
    etaMinima: Number(formData.get("etaMinima")),
    autore: listaOpzionale(formData.get("autore")),
    editore: listaOpzionale(formData.get("editore")),
    illustratori: listaOpzionale(formData.get("illustratori")),
    anno: formData.get("anno") ? Number(formData.get("anno")) : undefined,
    difficolta: Number(formData.get("difficolta") ?? 2) as DatiModificaGioco["difficolta"],
  };
  const permettiSyncBgg = formData.get("permettiSyncBgg") === "on";

  const gioco = await aggiornaGioco(id, dati, permettiSyncBgg);
  if (!gioco) throw new Error("Gioco non trovato.");

  revalidatePath("/");
  revalidatePath(`/giochi/${gioco.slug}`);
  revalidatePath("/admin/giochi");
  revalidatePath(`/admin/giochi/${gioco.id}`);
}

export async function eliminaGiocoAction(formData: FormData) {
  await richiediAdmin();
  const id = String(formData.get("id"));

  await eliminaGioco(id);

  revalidatePath("/");
  revalidatePath("/admin/giochi");
}
