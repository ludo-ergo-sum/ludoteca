// Normalizzazione difensiva di pagina/perPagina prima di usarli in aritmetica
// e in .skip()/.limit() (mongo) o .slice() (mock): FiltriCatalogo e' solo un
// tipo TypeScript, niente garantisce a runtime che i valori siano interi
// positivi. cercaCatalogoAction (src/lib/actions/games.ts) e' una server
// action pubblica, senza autenticazione ne' validazione di input, invocata
// come funzione da un componente client: un payload arbitrario (perPagina
// omesso, stringa, NaN, negativo, ...) puo' arrivare qui.
const PAGINA_PREDEFINITA = 1;
const PER_PAGINA_PREDEFINITA = 10;
const PER_PAGINA_MASSIMA = 100; // tetto: un perPagina enorme non deve forzare una scansione di tutta la collezione

function interoPositivo(valore: unknown, predefinito: number): number {
  const numero = Number(valore);
  if (!Number.isFinite(numero)) return predefinito; // non-numero, NaN, Infinity/-Infinity
  const intero = Math.trunc(numero);
  return intero >= 1 ? intero : predefinito; // 0, negativi, o float troncati a 0
}

export function normalizzaPaginazione(
  pagina: unknown,
  perPagina: unknown
): { pagina: number; perPagina: number } {
  return {
    pagina: interoPositivo(pagina, PAGINA_PREDEFINITA),
    perPagina: Math.min(interoPositivo(perPagina, PER_PAGINA_PREDEFINITA), PER_PAGINA_MASSIMA),
  };
}
