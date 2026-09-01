import { getTuttiITermini } from "@/lib/data/terminiBgg";
import { aggiornaTraduzioneTermineAction } from "@/lib/actions/terminiBgg";
import type { TerminBgg } from "@/lib/types";
import { btnOutline, inputBase } from "@/lib/ui";

export default async function AdminTraduzioniPage() {
  const termini = await getTuttiITermini();
  const categorie = termini.filter((t) => t.tipo === "categoria");
  const meccaniche = termini.filter((t) => t.tipo === "meccanica");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Traduzioni categorie e meccaniche</h1>
      <p className="mt-2 text-sm text-ink/60">
        Corregge il testo tradotto da DeepL durante la sync BGG. La correzione si applica subito anche ai giochi
        già importati che usano il termine, e non viene più sovrascritta dalle sync successive.
      </p>

      <SezioneTermini titolo="Categorie" termini={categorie} />
      <SezioneTermini titolo="Meccaniche" termini={meccaniche} />

      {termini.length === 0 && (
        <p className="mt-8 text-sm text-ink/60">
          Nessun termine tradotto ancora: verranno elencati qui dopo la prima sync BGG.
        </p>
      )}
    </div>
  );
}

function SezioneTermini({ titolo, termini }: { titolo: string; termini: TerminBgg[] }) {
  if (termini.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink">{titolo}</h2>
      <div className="mt-3 space-y-2">
        {termini.map((t) => (
          <form
            key={`${t.tipo}-${t.nomeInglese}`}
            action={aggiornaTraduzioneTermineAction}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-card p-3"
          >
            <input type="hidden" name="tipo" value={t.tipo} />
            <input type="hidden" name="nomeInglese" value={t.nomeInglese} />
            <span className="w-full flex-none truncate text-xs text-ink/50 sm:w-44" title={t.nomeInglese}>
              {t.nomeInglese}
            </span>
            <input name="nomeItaliano" defaultValue={t.nomeItaliano} className={`${inputBase} flex-1`} />
            <button type="submit" className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
              Salva
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
