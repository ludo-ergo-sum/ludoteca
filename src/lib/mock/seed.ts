import type {
  Copia,
  Gioco,
  ImpostazioniEmail,
  Preferito,
  Prestito,
  Recensione,
  RichiestaAcquisto,
  TemplateEmail,
  TerminBgg,
  Utente,
} from "@/lib/types";

// Dati di partenza per la fase di mock. Quando subentrera' MongoDB questo
// file verra' rimosso e le stesse forme arriveranno dalle collection reali.

export const giochiSeed: Gioco[] = [
  {
    id: "g1",
    slug: "catan",
    titolo: "Catan",
    descrizione:
      "Colonizza l'isola di Catan: raccogli risorse, costruisci strade e villaggi e negozia con gli altri giocatori per arrivare primo a 10 punti vittoria.",
    immagine: "",
    categorie: ["Strategia", "Negoziazione"],
    giocatoriMin: 3,
    giocatoriMax: 4,
    durataMinutiMin: 60,
    durataMinutiMax: 90,
    etaMinima: 10,
    autore: ["Klaus Teuber"],
    editore: ["Kosmos"],
    anno: 1995,
    difficolta: 3,
  },
  {
    id: "g2",
    slug: "carcassonne",
    titolo: "Carcassonne",
    descrizione:
      "Componi il paesaggio medievale tessera dopo tessera e piazza i tuoi seguaci per controllare citta', strade, chiostri e campi.",
    immagine: "",
    categorie: ["Piazzamento tessere", "Famiglia"],
    giocatoriMin: 2,
    giocatoriMax: 5,
    durataMinutiMin: 30,
    durataMinutiMax: 45,
    etaMinima: 7,
    autore: ["Klaus-Jürgen Wrede"],
    editore: ["Hans im Glück"],
    anno: 2000,
    difficolta: 2,
  },
  {
    id: "g3",
    slug: "ticket-to-ride",
    titolo: "Ticket to Ride",
    descrizione:
      "Collega citta' con le tue tratte ferroviarie, completa i biglietti destinazione segreti e blocca il passo agli avversari.",
    immagine: "",
    categorie: ["Famiglia", "Percorso"],
    giocatoriMin: 2,
    giocatoriMax: 5,
    durataMinutiMin: 30,
    durataMinutiMax: 60,
    etaMinima: 8,
    autore: ["Alan R. Moon"],
    editore: ["Days of Wonder"],
    anno: 2004,
    difficolta: 2,
  },
  {
    id: "g4",
    slug: "dixit",
    titolo: "Dixit",
    descrizione:
      "Racconta un indizio evocativo per la tua carta illustrata: gli altri devono indovinare quale sia, ma non troppo facilmente.",
    immagine: "",
    categorie: ["Party", "Creativo"],
    giocatoriMin: 3,
    giocatoriMax: 6,
    durataMinutiMin: 30,
    durataMinutiMax: 30,
    etaMinima: 8,
    autore: ["Jean-Louis Roubira"],
    editore: ["Libellud"],
    anno: 2008,
    difficolta: 1,
  },
  {
    id: "g5",
    slug: "splendor",
    titolo: "Splendor",
    descrizione:
      "Costruisci il tuo impero di gemme e commercio: acquista carte sviluppo, attira i nobili e accumula punti prestigio.",
    immagine: "",
    categorie: ["Economico", "Carte"],
    giocatoriMin: 2,
    giocatoriMax: 4,
    durataMinutiMin: 20,
    durataMinutiMax: 30,
    etaMinima: 10,
    autore: ["Marc André"],
    editore: ["Space Cowboys"],
    anno: 2014,
    difficolta: 2,
  },
];

// Vuota all'avvio: si popola durante la sync BGG (vedi src/lib/data/terminiBgg.ts).
export const terminiBggSeed: TerminBgg[] = [];

// Vuoti all'avvio: si popolano quando le socie votano/aggiungono preferiti.
export const recensioniSeed: Recensione[] = [];
export const preferitiSeed: Preferito[] = [];
export const richiesteAcquistoSeed: RichiestaAcquisto[] = [];

// Precompilati col testo identico a quello prima hardcoded in src/lib/email.ts:
// finche' nessun admin li modifica da /admin/email, le email restano uguali a
// prima (nessuna regressione visibile).
export const impostazioniEmailSeed: ImpostazioniEmail = {
  intestazione: "Ludo Ergo Sum — Ludoteca associativa",
  piePagina: "Ludo Ergo Sum · Via Foce 40, Imperia",
};

export const templateEmailSeed: TemplateEmail[] = [
  {
    chiave: "benvenuto",
    oggetto: "Benvenuto in Ludo Ergo Sum",
    corpo:
      "Ciao {{nome}},\n\nBenvenuto/a in Ludo Ergo Sum! Da ora puoi sfogliare il catalogo e richiedere in prestito i giochi disponibili in ludoteca.\n\nA presto in via Foce 40.",
  },
  {
    chiave: "nuovaRichiesta",
    oggetto: "Nuova richiesta di prestito: {{giocoTitolo}}",
    corpo:
      "{{socioNome}} ha richiesto in prestito {{giocoTitolo}}.\n\nVai su /admin/prestiti per approvare o rifiutare la richiesta.",
  },
  {
    chiave: "decisionePrestito",
    oggetto: "Richiesta {{risultato}}: {{giocoTitolo}}",
    corpo:
      "Ciao {{nome}},\n\nLa tua richiesta per {{giocoTitolo}} è stata {{esito}}.\n\n{{nota}}",
  },
  {
    chiave: "promemoria",
    oggetto: "Promemoria: restituzione di {{giocoTitolo}}",
    corpo:
      "Ciao {{nome}},\n\nIl prestito di {{giocoTitolo}} scade il {{dataScadenza}}. Ricordati di riportarlo in ludoteca.",
  },
  {
    chiave: "nuovaRichiestaAcquisto",
    oggetto: "Richiesta d'acquisto: {{espansioneTitolo}}",
    corpo:
      "{{socioNome}} ha segnalato {{espansioneTitolo}} (espansione di {{giocoBaseTitolo}}) come non presente in catalogo.\n\n{{messaggio}}\n\nVai su /admin/richieste-acquisto per gestire la richiesta.",
  },
];

export const copieSeed: Copia[] = [
  { id: "c1", giocoId: "g1", codice: "CAT-01", stato: "disponibile", noteAdmin: null, dataAcquisizione: "2023-03-01" },
  { id: "c2", giocoId: "g1", codice: "CAT-02", stato: "in_prestito", noteAdmin: null, dataAcquisizione: "2023-03-01" },
  { id: "c3", giocoId: "g2", codice: "CAR-01", stato: "disponibile", noteAdmin: null, dataAcquisizione: "2022-09-15" },
  { id: "c4", giocoId: "g2", codice: "CAR-02", stato: "offline", motivoOffline: "Mancano 3 tessere del paesaggio, in attesa di ricambio.", noteAdmin: "Verificare con Hans im Glück se vendono le tessere singole.", dataAcquisizione: "2022-09-15" },
  { id: "c5", giocoId: "g3", codice: "TTR-01", stato: "disponibile", noteAdmin: null, dataAcquisizione: "2024-01-10" },
  { id: "c6", giocoId: "g3", codice: "TTR-02", stato: "disponibile", noteAdmin: null, dataAcquisizione: "2024-01-10" },
  { id: "c7", giocoId: "g3", codice: "TTR-03", stato: "in_prestito", noteAdmin: null, dataAcquisizione: "2024-01-10" },
  { id: "c8", giocoId: "g4", codice: "DIX-01", stato: "disponibile", noteAdmin: "Scatola un po' rovinata agli angoli, gioco intatto.", dataAcquisizione: "2021-11-20" },
  { id: "c9", giocoId: "g5", codice: "SPL-01", stato: "disponibile", noteAdmin: null, dataAcquisizione: "2023-06-05" },
  { id: "c10", giocoId: "g5", codice: "SPL-02", stato: "disponibile", noteAdmin: null, dataAcquisizione: "2023-06-05" },
];

export const utentiSeed: Utente[] = [
  {
    id: "u-admin",
    googleId: "seed-admin",
    nome: "Segreteria Ludo Ergo Sum",
    email: "admin@ludoergosum.it",
    immagine: null,
    ruolo: "admin",
    dataIscrizione: "2020-01-01",
    quote: [
      { anno: 2024, inRegola: true, dataRegistrazione: "2024-01-05", registratoDa: "sistema" },
      { anno: 2025, inRegola: true, dataRegistrazione: "2025-01-08", registratoDa: "sistema" },
      { anno: 2026, inRegola: true, dataRegistrazione: "2026-01-03", registratoDa: "sistema" },
    ],
  },
  {
    id: "u1",
    googleId: "seed-u1",
    nome: "Giulia Ferraro",
    email: "giulia.ferraro@example.com",
    immagine: null,
    ruolo: "socio",
    dataIscrizione: "2022-04-12",
    quote: [
      { anno: 2024, inRegola: true, dataRegistrazione: "2024-02-01", registratoDa: "Segreteria Ludo Ergo Sum" },
      { anno: 2025, inRegola: true, dataRegistrazione: "2025-01-20", registratoDa: "Segreteria Ludo Ergo Sum" },
      { anno: 2026, inRegola: true, dataRegistrazione: "2026-01-15", registratoDa: "Segreteria Ludo Ergo Sum" },
    ],
  },
  {
    id: "u2",
    googleId: "seed-u2",
    nome: "Marco Bianchi",
    email: "marco.bianchi@example.com",
    immagine: null,
    ruolo: "socio",
    dataIscrizione: "2023-09-30",
    quote: [
      { anno: 2024, inRegola: true, dataRegistrazione: "2024-10-02", registratoDa: "Segreteria Ludo Ergo Sum" },
      { anno: 2025, inRegola: true, dataRegistrazione: "2025-01-11", registratoDa: "Segreteria Ludo Ergo Sum" },
      { anno: 2026, inRegola: false, dataRegistrazione: null, registratoDa: null, note: "Da contattare per il rinnovo." },
    ],
  },
];

export const prestitiSeed: Prestito[] = [
  {
    id: "p1",
    copiaId: "c2",
    giocoId: "g1",
    utenteId: "u1",
    stato: "in_corso",
    dataRichiesta: "2026-08-20",
    dataApprovazione: "2026-08-21",
    approvatoDa: "Segreteria Ludo Ergo Sum",
    dataRestituzioneEffettiva: null,
    gestitoDa: null,
  },
  {
    id: "p2",
    copiaId: "c7",
    giocoId: "g3",
    utenteId: "u2",
    stato: "in_corso",
    dataRichiesta: "2026-08-24",
    dataApprovazione: "2026-08-24",
    approvatoDa: "Segreteria Ludo Ergo Sum",
    dataRestituzioneEffettiva: null,
    gestitoDa: null,
  },
  {
    id: "p3",
    copiaId: "c9",
    giocoId: "g5",
    utenteId: "u1",
    stato: "in_attesa",
    dataRichiesta: "2026-08-30",
    dataApprovazione: null,
    approvatoDa: null,
    dataRestituzioneEffettiva: null,
    gestitoDa: null,
  },
  {
    id: "p4",
    copiaId: "c1",
    giocoId: "g1",
    utenteId: "u2",
    stato: "restituito",
    dataRichiesta: "2026-05-02",
    dataApprovazione: "2026-05-03",
    approvatoDa: "Segreteria Ludo Ergo Sum",
    dataRestituzioneEffettiva: "2026-05-18",
    gestitoDa: "Segreteria Ludo Ergo Sum",
  },
  {
    id: "p5",
    copiaId: "c5",
    giocoId: "g3",
    utenteId: "u1",
    stato: "restituito",
    dataRichiesta: "2026-03-10",
    dataApprovazione: "2026-03-10",
    approvatoDa: "Segreteria Ludo Ergo Sum",
    dataRestituzioneEffettiva: "2026-03-24",
    gestitoDa: "Segreteria Ludo Ergo Sum",
  },
  {
    id: "p6",
    copiaId: "c3",
    giocoId: "g2",
    utenteId: "u2",
    stato: "rifiutato",
    dataRichiesta: "2026-07-01",
    dataApprovazione: "2026-07-02",
    approvatoDa: "Segreteria Ludo Ergo Sum",
    dataRestituzioneEffettiva: null,
    gestitoDa: "Segreteria Ludo Ergo Sum",
    note: "Copia gia' promessa ad un altro socio per la stessa settimana.",
  },
];
