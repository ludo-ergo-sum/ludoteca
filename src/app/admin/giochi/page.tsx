import { getGiochi } from "@/lib/data/games";
import { getTutteLeCopie } from "@/lib/data/copies";
import { creaGiocoAction } from "@/lib/actions/games";
import { ListaGiochiAdmin } from "@/components/ListaGiochiAdmin";
import { btnAmber, inputBase, labelBase } from "@/lib/ui";

export default async function AdminGiochiPage() {
  const [giochi, copie] = await Promise.all([getGiochi(), getTutteLeCopie()]);
  const giocoIdsConCopieSospese = Array.from(
    new Set(copie.filter((c) => c.stato === "offline").map((c) => c.giocoId))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Giochi e copie</h1>

      <div className="mt-8">
        <ListaGiochiAdmin giochi={giochi} giocoIdsConCopieSospese={giocoIdsConCopieSospese} />
      </div>

      <details className="paper-card mt-10 rounded-2xl p-6">
        <summary className="cursor-pointer font-display text-lg text-ink">+ Aggiungi un nuovo gioco al catalogo</summary>
        <form action={creaGiocoAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="titolo">Titolo</label>
            <input id="titolo" name="titolo" required className={inputBase} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelBase} htmlFor="descrizione">Descrizione</label>
            <textarea id="descrizione" name="descrizione" required rows={3} className={inputBase} />
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
            <button type="submit" className={btnAmber}>
              Aggiungi gioco
            </button>
          </div>
        </form>
      </details>
    </div>
  );
}
