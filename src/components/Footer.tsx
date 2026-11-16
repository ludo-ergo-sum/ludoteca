import Link from "next/link";
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
          Via Foce, 40 — 18100 Imperia (IM)
        </div>
        <p className="text-xs text-ink/50">Associazione senza scopo di lucro per la promozione dei giochi da tavolo.</p>
      </div>
      <nav className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 border-t border-ink/10 px-4 py-4 text-xs text-ink/60 sm:px-6">
        <Link href="/privacy" className="hover:text-felt hover:underline">
          Privacy
        </Link>
        <Link href="/termini-di-servizio" className="hover:text-felt hover:underline">
          Termini di servizio
        </Link>
      </nav>
    </footer>
  );
}
