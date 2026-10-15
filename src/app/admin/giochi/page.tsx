import Link from "next/link";
import { Plus } from "lucide-react";
import { getGiochiAdmin, getOpzioniFiltroCatalogo } from "@/lib/data/games";
import { contaCopieSenzaEtichetta } from "@/lib/data/copies";
import { ListaGiochiAdmin, PER_PAGINA_GIOCHI_ADMIN } from "@/components/ListaGiochiAdmin";
import { btnAmber, btnOutline } from "@/lib/ui";

export default async function AdminGiochiPage() {
  const [{ giochi, totale }, opzioniFiltro, copieSenzaEtichetta] = await Promise.all([
    getGiochiAdmin({ pagina: 1, perPagina: PER_PAGINA_GIOCHI_ADMIN }),
    getOpzioniFiltroCatalogo(),
    contaCopieSenzaEtichetta(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Giochi e copie</h1>
        </div>
        <Link href="/admin/giochi/nuovo" className={`${btnAmber} inline-flex items-center gap-1.5`}>
          <Plus size={16} /> Aggiungi gioco
        </Link>
      </div>

      <div className="paper-card mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <p className="text-sm text-ink/70">
          <span className="font-display text-xl text-ink">{copieSenzaEtichetta}</span> copie senza etichetta
          stampata
        </p>
        <form action="/api/admin/etichette" method="POST" className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink/60">
            <input
              type="checkbox"
              name="includiGiaStampate"
              className="h-4 w-4 rounded border-ink/30 text-felt focus:ring-felt"
            />
            Includi anche le copie già stampate (ristampa tutto)
          </label>
          <button type="submit" className={btnOutline}>
            Genera etichette da stampare
          </button>
        </form>
      </div>

      <div className="mt-8">
        <ListaGiochiAdmin giochiIniziali={giochi} totaleIniziale={totale} opzioniFiltro={opzioniFiltro} />
      </div>
    </div>
  );
}
