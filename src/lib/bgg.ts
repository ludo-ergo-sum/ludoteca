import "server-only";
import { XMLParser } from "fast-xml-parser";
import type { DatiGiocoBgg } from "@/lib/data/games";

// Client per l'API pubblica xmlapi2 di BoardGameGeek. Sync one-way: leggiamo
// da BGG, non scriviamo mai nulla la'.

const BASE_URL = "https://boardgamegeek.com/xmlapi2";
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function attesa(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// L'XML API di BGG richiede un bearer token (vedi WWW-Authenticate sulle
// risposte 401): il token si genera dalle impostazioni dell'account BGG.
function headerAutenticazione(): HeadersInit {
  const token = process.env.BGG_API_TOKEN;
  if (!token) {
    throw new Error("BGG_API_TOKEN non configurato: necessario per chiamare l'XML API di BGG.");
  }
  return { Authorization: `Bearer ${token}` };
}

// Un array o un singolo oggetto in base a quanti elementi ci sono: fast-xml-parser
// non normalizza mai in array quando trova un solo tag ripetibile.
function comeLista<T>(valore: T | T[] | undefined): T[] {
  if (!valore) return [];
  return Array.isArray(valore) ? valore : [valore];
}

// fast-xml-parser decodifica solo le entita' XML standard (&amp; &lt; &gt;
// &quot; &apos;): i riferimenti numerici che BGG usa per apostrofi, accenti
// e a-capo (es. "&#039;", "&#10;") restano letterali e vanno decodificati a mano.
function decodificaTesto(testo: string | undefined): string {
  if (!testo) return "";
  return testo
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export interface VoceCollezioneBgg {
  bggId: number;
  nome: string;
}

// La collection endpoint di BGG a volte risponde 202 mentre genera l'export
// in background: bisogna ritentare finche' non e' pronto.
export async function recuperaCollezioneBgg(username: string): Promise<VoceCollezioneBgg[]> {
  const url = `${BASE_URL}/collection?username=${encodeURIComponent(username)}&own=1&stats=0`;
  const headers = headerAutenticazione();

  for (let tentativo = 0; tentativo < 3; tentativo++) {
    const risposta = await fetch(url, { headers });
    if (risposta.status === 202) {
      await attesa(2000);
      continue;
    }
    if (!risposta.ok) {
      throw new Error(`Errore BGG collection (${risposta.status}) per l'utente "${username}".`);
    }

    const xml = parser.parse(await risposta.text());
    const items = comeLista(xml?.items?.item);
    return items.map((item) => ({
      bggId: Number(item["@_objectid"]),
      nome: decodificaTesto(item?.name?.["#text"] ?? item?.name),
    }));
  }

  throw new Error(`Collezione BGG di "${username}" non pronta dopo diversi tentativi, riprovare.`);
}

function primoLink(links: unknown[], tipo: string): string | undefined {
  const link = (links as Array<Record<string, string>>).find((l) => l["@_type"] === tipo);
  const valore = link?.["@_value"];
  return valore ? decodificaTesto(valore) : undefined;
}

function difficoltaDaPeso(peso: number): 1 | 2 | 3 | 4 | 5 {
  if (!peso || Number.isNaN(peso)) return 3;
  const arrotondato = Math.round(peso);
  return Math.min(5, Math.max(1, arrotondato)) as 1 | 2 | 3 | 4 | 5;
}

async function fetchConRetry(url: string, tentativi = 3): Promise<Response> {
  const headers = headerAutenticazione();
  for (let i = 0; i < tentativi; i++) {
    const risposta = await fetch(url, { headers });
    if (risposta.status !== 429) return risposta;
    await attesa(1000 * (i + 1));
  }
  throw new Error(`Rate limit BGG persistente per ${url}.`);
}

// Batch da 20 alla volta, con una piccola pausa tra le chiamate, per rispettare
// i limiti dell'API BGG.
export async function recuperaDettagliBgg(ids: number[]): Promise<DatiGiocoBgg[]> {
  const risultati: DatiGiocoBgg[] = [];

  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20);
    const url = `${BASE_URL}/thing?id=${batch.join(",")}&stats=1`;
    const risposta = await fetchConRetry(url);
    if (!risposta.ok) {
      throw new Error(`Errore BGG thing (${risposta.status}) per gli id ${batch.join(",")}.`);
    }

    const xml = parser.parse(await risposta.text());
    const items = comeLista(xml?.items?.item);

    for (const item of items) {
      const nomi = comeLista(item.name);
      const nomePrimario = nomi.find((n) => n["@_type"] === "primary") ?? nomi[0];
      const links = comeLista(item.link);
      const categorie = (links as Array<Record<string, string>>)
        .filter((l) => l["@_type"] === "boardgamecategory")
        .map((l) => decodificaTesto(l["@_value"]));
      const peso = Number(item?.statistics?.ratings?.averageweight?.["@_value"] ?? 0);

      risultati.push({
        bggId: Number(item["@_id"]),
        titolo: decodificaTesto(nomePrimario?.["@_value"]),
        descrizione: decodificaTesto(item?.description),
        immagine: decodificaTesto(item?.image),
        categorie,
        giocatoriMin: Number(item?.minplayers?.["@_value"] ?? 1),
        giocatoriMax: Number(item?.maxplayers?.["@_value"] ?? 1),
        durataMinutiMin: Number(item?.minplaytime?.["@_value"] ?? 0),
        durataMinutiMax: Number(item?.maxplaytime?.["@_value"] ?? 0),
        etaMinima: Number(item?.minage?.["@_value"] ?? 0),
        autore: primoLink(links, "boardgamedesigner"),
        editore: primoLink(links, "boardgamepublisher"),
        anno: item?.yearpublished?.["@_value"] ? Number(item.yearpublished["@_value"]) : undefined,
        difficolta: difficoltaDaPeso(peso),
      });
    }

    if (i + 20 < ids.length) {
      await attesa(500);
    }
  }

  return risultati;
}
