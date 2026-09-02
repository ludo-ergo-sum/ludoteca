"use server";

import { revalidatePath } from "next/cache";
import { richiediAdmin, richiediSocio } from "@/lib/session";
import { creaRichiestaAcquisto, segnaRichiestaGestita } from "@/lib/data/richiesteAcquisto";
import { getGiocoById } from "@/lib/data/games";
import { ADMIN_EMAILS } from "@/lib/data/users";
import { inviaEmailNuovaRichiestaAcquisto } from "@/lib/email";

export async function creaRichiestaAcquistoAction(formData: FormData) {
  const socio = await richiediSocio();
  const bggId = Number(formData.get("bggId"));
  const titolo = String(formData.get("titolo"));
  const giocoBaseId = String(formData.get("giocoBaseId"));
  const messaggioGrezzo = formData.get("messaggio");
  const messaggio = messaggioGrezzo ? String(messaggioGrezzo).trim().slice(0, 500) : null;

  await creaRichiestaAcquisto({ bggId, titolo, giocoBaseId, utenteId: socio.id, messaggio });

  const giocoBase = await getGiocoById(giocoBaseId);
  await inviaEmailNuovaRichiestaAcquisto(ADMIN_EMAILS, {
    giocoBaseTitolo: giocoBase?.titolo ?? "Gioco",
    espansioneTitolo: titolo,
    socioNome: socio.nome,
    messaggio,
  });

  revalidatePath("/admin/richieste-acquisto");
}

export async function segnaRichiestaGestitaAction(formData: FormData) {
  await richiediAdmin();
  const id = String(formData.get("id"));
  await segnaRichiestaGestita(id);
  revalidatePath("/admin/richieste-acquisto");
}
