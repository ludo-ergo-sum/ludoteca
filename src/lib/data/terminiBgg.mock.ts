import "server-only";
import { store } from "@/lib/mock/store";
import type { TerminBgg, TipoTermineBgg } from "@/lib/types";

export async function getTermine(tipo: TipoTermineBgg, nomeInglese: string): Promise<TerminBgg | null> {
  return (
    store.terminiBgg.find((t) => t.tipo === tipo && t.nomeInglese.toLowerCase() === nomeInglese.toLowerCase()) ?? null
  );
}

// Propaga un cambio di nomeItaliano ai giochi che usano gia' il valore
// vecchio: altrimenti si vedrebbe solo sui prossimi giochi importati,
// lasciando quelli gia' sincronizzati indietro. Condivisa da salvaTraduzioneTermine
// (sync) e aggiornaTraduzioneTermine (correzione manuale in admin).
function propagaCambioTermine(tipo: TipoTermineBgg, vecchio: string, nuovo: string): void {
  if (vecchio === nuovo) return;
  const campo = tipo === "categoria" ? "categorie" : "meccaniche";
  for (const gioco of store.giochi) {
    const valori = gioco[campo];
    if (valori?.includes(vecchio)) {
      gioco[campo] = valori.map((v) => (v === vecchio ? nuovo : v));
    }
  }
}

// Upsert: la sync la chiama sia per termini nuovi sia per ritradurre un
// segnaposto in inglese (daRitradurre) una volta che DeepL e' di nuovo
// attivo — deve aggiornare la riga esistente, non duplicarla.
export async function salvaTraduzioneTermine(
  tipo: TipoTermineBgg,
  nomeInglese: string,
  nomeItaliano: string,
  daRitradurre = false
): Promise<void> {
  const esistente = store.terminiBgg.find(
    (t) => t.tipo === tipo && t.nomeInglese.toLowerCase() === nomeInglese.toLowerCase()
  );
  if (esistente) {
    const vecchio = esistente.nomeItaliano;
    esistente.nomeItaliano = nomeItaliano;
    esistente.daRitradurre = daRitradurre || undefined;
    propagaCambioTermine(tipo, vecchio, nomeItaliano);
    return;
  }
  store.terminiBgg.push({ tipo, nomeInglese, nomeItaliano, daRitradurre: daRitradurre || undefined });
}

export async function getTuttiITermini() {
  return [...store.terminiBgg].sort(
    (a, b) => a.tipo.localeCompare(b.tipo) || a.nomeInglese.localeCompare(b.nomeInglese)
  );
}

// Correzione manuale da /admin/traduzioni: conta sempre come traduzione
// vera, quindi azzera daRitradurre anche se era stato salvato come
// segnaposto. La descrizione (facoltativa) viene salvata insieme, stesso
// form/bottone.
export async function aggiornaTraduzioneTermine(
  tipo: TipoTermineBgg,
  nomeInglese: string,
  nomeItaliano: string,
  descrizione?: string
): Promise<void> {
  const termine = store.terminiBgg.find(
    (t) => t.tipo === tipo && t.nomeInglese.toLowerCase() === nomeInglese.toLowerCase()
  );
  if (!termine) return;
  termine.descrizione = descrizione || undefined;
  termine.daRitradurre = undefined;

  const vecchio = termine.nomeItaliano;
  termine.nomeItaliano = nomeItaliano;
  propagaCambioTermine(tipo, vecchio, nomeItaliano);
}

// Mappa nomeItaliano (minuscolo) -> descrizione, per i chip categoria/
// meccanica nel catalogo e nel dettaglio gioco (che mostrano solo il nome
// italiano, non l'id inglese usato come chiave in questa anagrafica).
export async function getDescrizioniByTipo(tipo: TipoTermineBgg): Promise<Map<string, string>> {
  const mappa = new Map<string, string>();
  for (const t of store.terminiBgg) {
    if (t.tipo === tipo && t.descrizione) mappa.set(t.nomeItaliano.toLowerCase(), t.descrizione);
  }
  return mappa;
}
