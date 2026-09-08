"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin } from "@/lib/session";
import {
  eliminaSocio,
  getSocieAdmin,
  impostaQuotaAnnuale,
  impostaRuolo,
  type FiltriSocieAdmin,
  type PaginaSocie,
} from "@/lib/data/users";
import { getPrestitiByUtente } from "@/lib/data/loans";
import type { Ruolo } from "@/lib/types";

const STATI_PRESTITO_ATTIVI = ["in_attesa", "approvato", "in_corso"];

// Usata da ListaSocieQuote per il tab Tutte/Da-rinnovare/In-regola e per lo
// scroll infinito: una query db per pagina/filtro, non un .filter() in
// memoria sull'intero elenco socie.
export async function cercaSocieAdminAction(filtri: FiltriSocieAdmin): Promise<PaginaSocie> {
  await richiediAdmin();
  return getSocieAdmin(filtri);
}

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

export async function eliminaSocioAction(formData: FormData) {
  const admin = await richiediAdmin();
  const utenteId = String(formData.get("utenteId"));

  if (utenteId === admin.id) {
    throw new Error("Non puoi eliminare il tuo stesso account.");
  }

  const prestiti = await getPrestitiByUtente(utenteId);
  if (prestiti.some((p) => STATI_PRESTITO_ATTIVI.includes(p.stato))) {
    throw new Error("Il socio ha ancora copie in prestito o richieste in attesa: falle restituire prima di eliminarlo.");
  }

  await eliminaSocio(utenteId);

  revalidatePath("/admin/socie");
}
