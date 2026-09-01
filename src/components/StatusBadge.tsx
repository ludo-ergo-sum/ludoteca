import type { StatoCopia, StatoPrestito } from "@/lib/types";

const stiliCopia: Record<StatoCopia, string> = {
  disponibile: "bg-felt/10 text-felt border-felt/30",
  in_prestito: "bg-amber/15 text-amber-strong border-amber/40",
  offline: "bg-coral-soft text-coral border-coral/40",
};

const etichetteCopia: Record<StatoCopia, string> = {
  disponibile: "Disponibile",
  in_prestito: "In prestito",
  offline: "Fuori linea",
};

export function BadgeStatoCopia({ stato }: { stato: StatoCopia }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${stiliCopia[stato]}`}
    >
      {etichetteCopia[stato]}
    </span>
  );
}

const stiliPrestito: Record<StatoPrestito, string> = {
  in_attesa: "bg-amber/15 text-amber-strong border-amber/40",
  approvato: "bg-felt/10 text-felt border-felt/30",
  in_corso: "bg-felt/10 text-felt border-felt/30",
  rifiutato: "bg-coral-soft text-coral border-coral/40",
  restituito: "bg-sage/15 text-sage border-sage/40",
  annullato: "bg-ink/5 text-ink/50 border-ink/20",
};

const etichettePrestito: Record<StatoPrestito, string> = {
  in_attesa: "In attesa di approvazione",
  approvato: "Approvato",
  in_corso: "In corso",
  rifiutato: "Rifiutato",
  restituito: "Restituito",
  annullato: "Annullato",
};

export function BadgeStatoPrestito({ stato }: { stato: StatoPrestito }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${stiliPrestito[stato]}`}
    >
      {etichettePrestito[stato]}
    </span>
  );
}

export function BadgeSocioInRegola({ inRegola }: { inRegola: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        inRegola ? "bg-felt/10 text-felt border-felt/30" : "bg-coral-soft text-coral border-coral/40"
      }`}
    >
      {inRegola ? "In regola" : "Da rinnovare"}
    </span>
  );
}
