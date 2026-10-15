import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { creaGiocoAction } from "@/lib/actions/games";
import { BottoneInvio } from "@/components/BottoneInvio";
import { btnAmber, inputBase, labelBase } from "@/lib/ui";

export default function AdminNuovoGiocoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/admin/giochi" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-felt">
        <ArrowLeft size={15} /> Giochi
      </Link>

      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Aggiungi un nuovo gioco</h1>

      <div className="paper-card mt-6 rounded-2xl p-6">
        <form action={creaGiocoAction} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="titolo">Titolo</label>
            <input id="titolo" name="titolo" required className={inputBase} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="descrizione">Descrizione</label>
            <textarea id="descrizione" name="descrizione" required rows={4} className={inputBase} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="categorie">Categorie (separate da virgola)</label>
            <input id="categorie" name="categorie" placeholder="Famiglia, Strategia" className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="giocatoriMin">Giocatori minimi</label>
            <input id="giocatoriMin" name="giocatoriMin" type="number" min={1} required className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="giocatoriMax">Giocatori massimi</label>
            <input id="giocatoriMax" name="giocatoriMax" type="number" min={1} required className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="durataMinutiMin">Durata minima (min)</label>
            <input id="durataMinutiMin" name="durataMinutiMin" type="number" min={5} required className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="durataMinutiMax">Durata massima (min)</label>
            <input id="durataMinutiMax" name="durataMinutiMax" type="number" min={5} required className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="etaMinima">Età minima</label>
            <input id="etaMinima" name="etaMinima" type="number" min={0} required className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="difficolta">Difficoltà (1-5)</label>
            <input id="difficolta" name="difficolta" type="number" min={1} max={5} defaultValue={2} className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="autore">Autore</label>
            <input id="autore" name="autore" className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="editore">Editore</label>
            <input id="editore" name="editore" className={inputBase} />
          </div>
          <div>
            <label className={labelBase} htmlFor="anno">Anno di pubblicazione</label>
            <input id="anno" name="anno" type="number" className={inputBase} />
          </div>
          <div className="sm:col-span-2">
            <BottoneInvio className={btnAmber}>Aggiungi gioco</BottoneInvio>
          </div>
        </form>
      </div>
    </div>
  );
}
