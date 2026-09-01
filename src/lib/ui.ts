// Classi Tailwind condivise per i controlli piu' ricorrenti, cosi' i bottoni
// hanno lo stesso linguaggio visivo ovunque compaiano (pagine pubbliche,
// area socio, area admin).

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-felt px-5 py-2.5 text-sm font-semibold text-card transition hover:bg-felt-dim disabled:cursor-not-allowed disabled:opacity-50";

export const btnAmber =
  "inline-flex items-center justify-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-amber-strong disabled:cursor-not-allowed disabled:opacity-50";

export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-felt hover:text-felt disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-card transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSmall =
  "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export const inputBase =
  "w-full rounded-xl border border-ink/15 bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-felt focus:outline-none";

export const labelBase = "mb-1.5 block text-sm font-medium text-ink/80";
