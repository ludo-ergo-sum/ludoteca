import type {
  Copia,
  Gioco,
  Preferito,
  Prestito,
  Recensione,
  RichiestaAcquisto,
  TerminBgg,
  Utente,
} from "@/lib/types";
import {
  copieSeed,
  giochiSeed,
  preferitiSeed,
  prestitiSeed,
  recensioniSeed,
  richiesteAcquistoSeed,
  terminiBggSeed,
  utentiSeed,
} from "@/lib/mock/seed";

// Store in memoria che simula il database durante la fase di mock.
// Agganciato a globalThis per sopravvivere al hot-reload di Next.js in
// sviluppo. Ogni funzione di lib/data/* legge/scrive solo da qui: quando
// arrivera' MongoDB, questo file sara' l'unico punto da sostituire con le
// vere collection.

interface MockStore {
  giochi: Gioco[];
  copie: Copia[];
  utenti: Utente[];
  prestiti: Prestito[];
  terminiBgg: TerminBgg[];
  recensioni: Recensione[];
  preferiti: Preferito[];
  richiesteAcquisto: RichiestaAcquisto[];
}

const globalForStore = globalThis as unknown as { __lesMockStore?: MockStore };

function creaStore(): MockStore {
  return {
    giochi: structuredClone(giochiSeed),
    copie: structuredClone(copieSeed),
    utenti: structuredClone(utentiSeed),
    prestiti: structuredClone(prestitiSeed),
    terminiBgg: structuredClone(terminiBggSeed),
    recensioni: structuredClone(recensioniSeed),
    preferiti: structuredClone(preferitiSeed),
    richiesteAcquisto: structuredClone(richiesteAcquistoSeed),
  };
}

export const store: MockStore = globalForStore.__lesMockStore ?? creaStore();
globalForStore.__lesMockStore = store;

let contatorePrestiti = store.prestiti.length;
export function prossimoIdPrestito(): string {
  contatorePrestiti += 1;
  return `p${contatorePrestiti}`;
}

let contatoreCopie = store.copie.length;
export function prossimoIdCopia(): string {
  contatoreCopie += 1;
  return `c${contatoreCopie}`;
}

let contatoreGiochi = store.giochi.length;
export function prossimoIdGioco(): string {
  contatoreGiochi += 1;
  return `g${contatoreGiochi}`;
}

let contatoreRecensioni = store.recensioni.length;
export function prossimoIdRecensione(): string {
  contatoreRecensioni += 1;
  return `r${contatoreRecensioni}`;
}

let contatoreRichiesteAcquisto = store.richiesteAcquisto.length;
export function prossimoIdRichiestaAcquisto(): string {
  contatoreRichiesteAcquisto += 1;
  return `ra${contatoreRichiesteAcquisto}`;
}
