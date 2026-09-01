import { NextRequest, NextResponse } from "next/server";
import { getUtenteCorrente } from "@/lib/session";
import { getCopieSenzaEtichetta, getTutteLeCopie, segnaEtichetteStampate } from "@/lib/data/copies";
import { getGiochi } from "@/lib/data/games";
import { generaPdfEtichette } from "@/lib/etichette";

// Route Handler (non server action): deve rispondere con un binary e
// Content-Disposition: attachment, cosa che una server action non puo' fare.
// Chiamata da un form HTML semplice (POST), il browser gestisce il download.
export async function POST(req: NextRequest) {
  const utente = await getUtenteCorrente();
  if (utente?.ruolo !== "admin") {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  const formData = await req.formData();
  const includiGiaStampate = formData.get("includiGiaStampate") === "on";

  const [copie, giochi] = await Promise.all([
    includiGiaStampate ? getTutteLeCopie() : getCopieSenzaEtichetta(),
    getGiochi(),
  ]);
  const giochiMap = new Map(giochi.map((g) => [g.id, g]));
  const voci = copie.map((c) => ({
    codice: c.codice,
    titoloGioco: giochiMap.get(c.giocoId)?.titolo ?? "Gioco",
    giocoId: c.giocoId,
  }));

  const pdf = await generaPdfEtichette(voci);
  await segnaEtichetteStampate(copie.map((c) => c.id));

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="etichette-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
