import { Dice5, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 font-display text-base text-ink">
          <Dice5 size={18} />
          Ludo Ergo Sum
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={15} />
          Via Foce, 40 — Imperia
        </div>
        <p className="text-xs text-ink/50">Associazione senza scopo di lucro per la promozione dei giochi da tavolo.</p>
      </div>
    </footer>
  );
}
