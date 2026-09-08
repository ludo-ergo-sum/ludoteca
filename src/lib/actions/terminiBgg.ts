"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import { aggiornaTraduzioneTermine, getTerminiAdmin, type FiltriTermini, type PaginaTermini } from "@/lib/data/terminiBgg";
import type { TipoTermineBgg } from "@/lib/types";

// Usata da ListaTerminiAdmin (tab Tutti/Da-tradurre/Tradotte + filtro
// con/senza descrizione, sezioni Categorie/Meccaniche di /admin/traduzioni)
// per lo scroll infinito: una query db per pagina/filtro, non un .filter()
// in memoria sull'intero vocabolario.
export async function cercaTerminiAction(filtri: FiltriTermini): Promise<PaginaTermini> {
  await richiediAdmin();
  return getTerminiAdmin(filtri);
}

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
