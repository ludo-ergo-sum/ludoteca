import "server-only";
import { recuperaCollezioneBgg, recuperaDettagliBgg } from "@/lib/bgg";
import { traduciTesti, traduzioneAttiva } from "@/lib/deepl";
import { getGiocoByBggId, sincronizzaGiocoDaBgg, type DatiGiocoBgg } from "@/lib/data/games";
import { creaCopia } from "@/lib/data/copies";
import { getTraduzioneTermine, salvaTraduzioneTermine } from "@/lib/data/terminiBgg";
import type { TipoTermineBgg } from "@/lib/types";

export type ModalitaSyncBgg = "totale" | "parziale";

export interface RisultatoSyncBgg {
  modalita: ModalitaSyncBgg;
  limite: number;
  collezioneTotale: number;
  totale: number;
  creati: number;
  aggiornati: number;
  saltati: number;
  terminiTassonomia: number;
  nuoviTerminiTradotti: number;
  errori: { bggId: number; messaggio: string }[];
}

export type EsitoSyncBgg = { ok: true; dati: RisultatoSyncBgg } | { ok: false; status: number; errore: string };

// Stesso criterio del prefisso suggerito nel form admin (src/app/admin/giochi/[id]/page.tsx).
function prefissoCodice(titolo: string): string {
  const prefisso = titolo.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  return prefisso || "GEN";
}

// Categorie/meccaniche BGG sono un vocabolario chiuso (poche decine di
// valori): si traduce ogni nome inglese una sola volta e si tiene in
// anagrafica (src/lib/data/terminiBgg.ts, confronto case-insensitive) per non
// richiamare DeepL di nuovo sugli stessi termini nelle sync successive.
async function traduciTassonomie(dettagli: DatiGiocoBgg[]): Promise<{ nuoviTermini: number; termini: number }> {
  const distinti = new Map<string, { tipo: TipoTermineBgg; nomeInglese: string }>();
  for (const d of dettagli) {
    for (const c of d.categorie) distinti.set(`categoria:${c.toLowerCase()}`, { tipo: "categoria", nomeInglese: c });
    for (const m of d.meccaniche ?? []) {
      distinti.set(`meccanica:${m.toLowerCase()}`, { tipo: "meccanica", nomeInglese: m });
    }
  }

  const mappa = new Map<string, string>();
  const daTradurre: { tipo: TipoTermineBgg; nomeInglese: string; chiave: string }[] = [];

  for (const [chiave, voce] of distinti) {
    const cache = await getTraduzioneTermine(voce.tipo, voce.nomeInglese);
    if (cache) {
      mappa.set(chiave, cache);
    } else {
      daTradurre.push({ ...voce, chiave });
    }
  }

  if (daTradurre.length > 0) {
    const tradotti = await traduciTesti(daTradurre.map((v) => v.nomeInglese));
    // Se la traduzione e' disattivata (vedi ENABLE_DEEPL_TRANSLATION),
    // traduciTesti ritorna il testo inglese invariato: non lo si salva in
    // anagrafica come se fosse la traduzione definitiva, altrimenti
    // resterebbe in inglese per sempre anche a traduzione riattivata.
    const daMemorizzare = traduzioneAttiva();
    for (let i = 0; i < daTradurre.length; i++) {
      const { tipo, nomeInglese, chiave } = daTradurre[i];
      const nomeItaliano = tradotti[i];
      mappa.set(chiave, nomeItaliano);
      if (daMemorizzare) await salvaTraduzioneTermine(tipo, nomeInglese, nomeItaliano);
    }
  }

  for (const d of dettagli) {
    d.categorie = d.categorie.map((c) => mappa.get(`categoria:${c.toLowerCase()}`) ?? c);
    if (d.meccaniche) {
      d.meccaniche = d.meccaniche.map((m) => mappa.get(`meccanica:${m.toLowerCase()}`) ?? m);
    }
  }

  return { nuoviTermini: daTradurre.length, termini: distinti.size };
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

  // Un admin puo' aver modificato a mano un gioco gia' importato: si filtra
  // qui, prima di chiamare BGG/DeepL, per non sprecare la traduzione su un
  // risultato che verrebbe comunque scartato (vedi guardia in
  // sincronizzaGiocoDaBgg, che resta comunque la rete di sicurezza finale).
  let saltati = 0;
  const daImportareFiltrati = [];
  for (const voce of daImportare) {
    const esistente = await getGiocoByBggId(voce.bggId);
    if (esistente?.bggSyncBloccata) {
      saltati++;
    } else {
      daImportareFiltrati.push(voce);
    }
  }
  daImportare = daImportareFiltrati;

  const risultati: RisultatoSyncBgg = {
    modalita: opts.modalita,
    limite: opts.limite,
    collezioneTotale: collezione.length,
    totale: daImportare.length,
    creati: 0,
    aggiornati: 0,
    saltati,
    terminiTassonomia: 0,
    nuoviTerminiTradotti: 0,
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

    const descrizioniTradotte = await traduciTesti(dettagli.map((d) => d.descrizione));
    dettagli.forEach((d, i) => {
      d.descrizione = descrizioniTradotte[i];
    });
    const esitoTassonomie = await traduciTassonomie(dettagli);
    risultati.terminiTassonomia = esitoTassonomie.termini;
    risultati.nuoviTerminiTradotti = esitoTassonomie.nuoviTermini;

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
