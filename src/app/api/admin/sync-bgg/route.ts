import { NextRequest, NextResponse } from "next/server";
import { eseguiSyncBgg, type ModalitaSyncBgg } from "@/lib/syncBgg";

export const maxDuration = 60;

interface CorpoRichiesta {
  modalita?: ModalitaSyncBgg;
  limite?: number;
}

export async function POST(req: NextRequest) {
  const chiave = req.headers.get("x-api-key");
  if (!process.env.BGG_SYNC_API_KEY || chiave !== process.env.BGG_SYNC_API_KEY) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  const corpo: CorpoRichiesta = await req.json().catch(() => ({}));

  if (corpo.modalita !== undefined && corpo.modalita !== "totale" && corpo.modalita !== "parziale") {
    return NextResponse.json(
      { errore: `Modalita' "${corpo.modalita}" non valida: usare "totale" o "parziale".` },
      { status: 400 }
    );
  }
  const modalita: ModalitaSyncBgg = corpo.modalita ?? "totale";
  const limite = corpo.limite && corpo.limite > 0 ? corpo.limite : 5;

  const esito = await eseguiSyncBgg({ modalita, limite });
  if (!esito.ok) {
    return NextResponse.json({ errore: esito.errore }, { status: esito.status });
  }
  return NextResponse.json(esito.dati);
}
