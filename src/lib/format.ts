// Un min-max identico (es. "30-30 min", spesso cosi' su BGG) si mostra come
// singolo valore invece che come intervallo degenere.
export function formattaIntervallo(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`;
}

// Numeri grandi (es. i voti BGG) mostrati in forma compatta: "113593" -> "113k+".
export function formattaNumeroCompatto(numero: number): string {
  if (numero >= 1000) return `${Math.floor(numero / 1000)}k+`;
  return String(numero);
}
