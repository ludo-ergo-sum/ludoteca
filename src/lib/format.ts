// Un min-max identico (es. "30-30 min", spesso cosi' su BGG) si mostra come
// singolo valore invece che come intervallo degenere.
export function formattaIntervallo(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`;
}
