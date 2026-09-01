import "server-only";

// Traduzione best-effort durante la sync BGG (descrizioni, categorie,
// meccaniche): se DeepL non e' configurato o fallisce, si ricade sul testo
// originale (in inglese) invece di interrompere l'importazione dei giochi.

const DIMENSIONE_CHUNK = 50;

function attesa(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function urlDeepL(chiave: string): string {
  return chiave.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

async function traduciChunk(testi: string[], chiave: string): Promise<string[]> {
  const url = urlDeepL(chiave);

  for (let tentativo = 0; tentativo < 3; tentativo++) {
    let risposta: Response;
    try {
      risposta = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${chiave}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: testi, source_lang: "EN", target_lang: "IT" }),
      });
    } catch (errore) {
      console.error("Traduzione DeepL non riuscita (rete), ricado sul testo originale.", errore);
      return testi;
    }

    if (risposta.status === 429) {
      await attesa(1000 * (tentativo + 1));
      continue;
    }
    if (!risposta.ok) {
      console.error(`Traduzione DeepL non riuscita (${risposta.status}), ricado sul testo originale.`);
      return testi;
    }

    const dati = await risposta.json();
    const traduzioni = dati?.translations as Array<{ text: string }> | undefined;
    if (!traduzioni || traduzioni.length !== testi.length) {
      console.error("Risposta DeepL inattesa, ricado sul testo originale.");
      return testi;
    }
    return traduzioni.map((t) => t.text);
  }

  console.error("Rate limit DeepL persistente, ricado sul testo originale.");
  return testi;
}

// ENABLE_DEEPL_TRANSLATION=false permette di disattivare la traduzione senza
// toccare DEEPL_API_KEY: comodo in sviluppo, dove riavviare spesso il server
// azzera lo store in memoria e ogni sync successiva ritraduce tutto da capo,
// consumando la quota DeepL per niente.
export function traduzioneAttiva(): boolean {
  return Boolean(process.env.DEEPL_API_KEY) && process.env.ENABLE_DEEPL_TRANSLATION !== "false";
}

export async function traduciTesti(testi: string[]): Promise<string[]> {
  if (!traduzioneAttiva() || testi.length === 0) return testi;
  const chiave = process.env.DEEPL_API_KEY as string;

  const risultati: string[] = [];
  for (let i = 0; i < testi.length; i += DIMENSIONE_CHUNK) {
    const chunk = testi.slice(i, i + DIMENSIONE_CHUNK);
    risultati.push(...(await traduciChunk(chunk, chiave)));
  }
  return risultati;
}
