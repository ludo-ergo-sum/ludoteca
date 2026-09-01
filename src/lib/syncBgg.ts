import "server-only";
import { recuperaCollezioneBgg, recuperaDettagliBgg } from "@/lib/bgg";
import { traduciDescrizioni } from "@/lib/deepl";
import { getGiocoByBggId, sincronizzaGiocoDaBgg } from "@/lib/data/games";
import { creaCopia } from "@/lib/data/copies";

export type ModalitaSyncBgg = "totale" | "parziale";

export interface RisultatoSyncBgg {
  modalita: ModalitaSyncBgg;
  limite: number;
  collezioneTotale: number;
  totale: number;
  creati: number;
  aggiornati: number;
  errori: { bggId: number; messaggio: string }[];
}

export type EsitoSyncBgg = { ok: true; dati: RisultatoSyncBgg } | { ok: false; status: number; errore: string };

// Stesso criterio del prefisso suggerito nel form admin (src/app/admin/giochi/[id]/page.tsx).
function prefissoCodice(titolo: string): string {
  const prefisso = titolo.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  return prefisso || "GEN";
}

// Logica di sync condivisa tra la rotta admin (POST, manuale, protetta da
// x-api-key) e il cron notturno (GET, automatico, protetto da CRON_SECRET) —
// entrambe le rotte restano un thin wrapper attorno a questa funzione.
export async function eseguiSyncBgg(opts: { modalita: ModalitaSyncBgg; limite: number }): Promise<EsitoSyncBgg> {
  const username = process.env.BGG_USERNAME;
  if (!username) {
    return { ok: false, status: 500, errore: "BGG_USERNAME non configurato." };
  }

  let collezione;
  try {
    collezione = await recuperaCollezioneBgg(username);
  } catch (errore) {
    return {
      ok: false,
      status: 502,
      errore: errore instanceof Error ? errore.message : "Errore nel leggere la collezione BGG.",
    };
  }

  let daImportare = collezione;
  if (opts.modalita === "parziale") {
    const nonAncoraImportati = [];
    for (const voce of collezione) {
      if (!(await getGiocoByBggId(voce.bggId))) {
        nonAncoraImportati.push(voce);
      }
      if (nonAncoraImportati.length >= opts.limite) break;
    }
    daImportare = nonAncoraImportati;
  }

  const risultati: RisultatoSyncBgg = {
    modalita: opts.modalita,
    limite: opts.limite,
    collezioneTotale: collezione.length,
    totale: daImportare.length,
    creati: 0,
    aggiornati: 0,
    errori: [],
  };

  if (daImportare.length > 0) {
    let dettagli: Awaited<ReturnType<typeof recuperaDettagliBgg>> = [];
    try {
      dettagli = await recuperaDettagliBgg(daImportare.map((v) => v.bggId));
    } catch (errore) {
      return {
        ok: false,
        status: 502,
        errore: errore instanceof Error ? errore.message : "Errore nel leggere i dettagli da BGG.",
      };
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

  return { ok: true, dati: risultati };
}
