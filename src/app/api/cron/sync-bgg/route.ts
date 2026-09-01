import { NextRequest, NextResponse } from "next/server";
import { eseguiSyncBgg } from "@/lib/syncBgg";

export const maxDuration = 60;

// Sync notturna automatica (vedi vercel.json): "parziale" con un limite alto
// invece di "totale" per non riprocessare/ritradurre ogni notte l'intero
// catalogo — con centinaia di giochi una sync totale ogni notte esaurirebbe
// in pochi giorni la quota gratuita di DeepL (500k caratteri/mese). Importa
// solo i giochi nuovi apparsi nella collezione BGG dall'ultima sync.
const LIMITE_NOTTURNO = 50;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  const esito = await eseguiSyncBgg({ modalita: "parziale", limite: LIMITE_NOTTURNO });
  if (!esito.ok) {
    return NextResponse.json({ errore: esito.errore }, { status: esito.status });
  }
  return NextResponse.json(esito.dati);
}
