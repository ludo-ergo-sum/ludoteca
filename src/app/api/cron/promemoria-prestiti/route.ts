import { NextRequest, NextResponse } from "next/server";
import { getPrestitiDaSollecitare, segnaPromemoriaInviato } from "@/lib/data/loans";
import { getGiocoById } from "@/lib/data/games";
import { getUtenteById } from "@/lib/data/users";
import { inviaEmailPromemoria } from "@/lib/email";

// Invocata da Vercel Cron (vedi vercel.json): Vercel imposta automaticamente
// l'header Authorization con CRON_SECRET quando chiama questa rotta.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  const daSollecitare = await getPrestitiDaSollecitare();
  let inviate = 0;

  for (const prestito of daSollecitare) {
    const [gioco, socio] = await Promise.all([
      getGiocoById(prestito.giocoId),
      getUtenteById(prestito.utenteId),
    ]);
    if (gioco && socio && prestito.dataScadenza) {
      await inviaEmailPromemoria(socio, { giocoTitolo: gioco.titolo, dataScadenza: prestito.dataScadenza });
      await segnaPromemoriaInviato(prestito.id);
      inviate++;
    }
  }

  return NextResponse.json({ totale: daSollecitare.length, inviate });
}
