// Elenco di valori distinti (case-sensitive, ordinati) estratti da una
// collezione — stesso criterio riusato per i filtri categorie/meccaniche nel
// catalogo pubblico, nello storico prestiti e nell'elenco admin dei giochi.
export function opzioniDistinte<T>(elementi: T[], campo: (el: T) => string[]): string[] {
  return Array.from(new Set(elementi.flatMap(campo))).sort((a, b) => a.localeCompare(b));
}
