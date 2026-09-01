import { NextRequest, NextResponse } from "next/server";
import { recuperaCollezioneBgg, recuperaDettagliBgg } from "@/lib/bgg";
import { traduciDescrizioni } from "@/lib/deepl";
import { getGiocoByBggId, sincronizzaGiocoDaBgg } from "@/lib/data/games";
import { creaCopia } from "@/lib/data/copies";

export const maxDuration = 60;

type Modalita = "totale" | "parziale";

interface CorpoRichiesta {
  modalita?: Modalita;
  limite?: number;
}

// Stesso criterio del prefisso suggerito nel form admin (src/app/admin/giochi/[id]/page.tsx).
function prefissoCodice(titolo: string): string {
  const prefisso = titolo.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  return prefisso || "GEN";
}

export async function POST(req: NextRequest) {
  const chiave = req.headers.get("x-api-key");
  if (!process.env.BGG_SYNC_API_KEY || chiave !== process.env.BGG_SYNC_API_KEY) {
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  }

  const username = process.env.BGG_USERNAME;
  if (!username) {
    return NextResponse.json({ errore: "BGG_USERNAME non configurato." }, { status: 500 });
  }

  const corpo: CorpoRichiesta = await req.json().catch(() => ({}));

  if (corpo.modalita !== undefined && corpo.modalita !== "totale" && corpo.modalita !== "parziale") {
    return NextResponse.json(
      { errore: `Modalita' "${corpo.modalita}" non valida: usare "totale" o "parziale".` },
      { status: 400 }
    );
  }
  const modalita: Modalita = corpo.modalita ?? "totale";
  const limite = corpo.limite && corpo.limite > 0 ? corpo.limite : 5;

  let collezione;
  try {
    collezione = await recuperaCollezioneBgg(username);
  } catch (errore) {
    return NextResponse.json(
      { errore: errore instanceof Error ? errore.message : "Errore nel leggere la collezione BGG." },
      { status: 502 }
    );
  }

  let daImportare = collezione;
  if (modalita === "parziale") {
    const nonAncoraImportati = [];
    for (const voce of collezione) {
      if (!(await getGiocoByBggId(voce.bggId))) {
        nonAncoraImportati.push(voce);
      }
      if (nonAncoraImportati.length >= limite) break;
    }
    daImportare = nonAncoraImportati;
  }

  const risultati = {
    modalita,
    limite,
    collezioneTotale: collezione.length,
    totale: daImportare.length,
    creati: 0,
    aggiornati: 0,
    errori: [] as { bggId: number; messaggio: string }[],
  };

  if (daImportare.length > 0) {
    let dettagli: Awaited<ReturnType<typeof recuperaDettagliBgg>> = [];
    try {
      dettagli = await recuperaDettagliBgg(daImportare.map((v) => v.bggId));
    } catch (errore) {
      return NextResponse.json(
        { errore: errore instanceof Error ? errore.message : "Errore nel leggere i dettagli da BGG." },
        { status: 502 }
      );
    }

    const descrizioniTradotte = await traduciDescrizioni(dettagli.map((d) => d.descrizione));
    dettagli.forEach((d, i) => {
      d.descrizione = descrizioniTradotte[i];
    });

    for (const dati of dettagli) {
      try {
        const { gioco, creato } = await sincronizzaGiocoDaBgg(dati);
        if (creato) {
          risultati.creati += 1;
          await creaCopia(gioco.id, prefissoCodice(gioco.titolo));
        } else {
          risultati.aggiornati += 1;
        }
      } catch (errore) {
        risultati.errori.push({
          bggId: dati.bggId,
          messaggio: errore instanceof Error ? errore.message : "Errore sconosciuto.",
        });
      }
    }
  }

  return NextResponse.json(risultati);
}
