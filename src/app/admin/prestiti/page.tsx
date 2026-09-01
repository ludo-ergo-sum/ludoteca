import { getTuttiIPrestitiConDettagli } from "@/lib/data/enriched";
import { getUtenteById } from "@/lib/data/users";
import { BadgeStatoPrestito } from "@/components/StatusBadge";
import { decidiPrestitoAction, registraRientroAction } from "@/lib/actions/loans";
import { btnDanger, btnPrimary } from "@/lib/ui";

export default async function AdminPrestitiPage() {
  const prestiti = await getTuttiIPrestitiConDettagli();
  const inAttesa = prestiti.filter((p) => p.stato === "in_attesa");
  const inCorso = prestiti.filter((p) => p.stato === "in_corso" || p.stato === "approvato");
  const conclusi = prestiti.filter((p) => !inAttesa.includes(p) && !inCorso.includes(p));

  const socie = await Promise.all(prestiti.map((p) => getUtenteById(p.utenteId)));
  const socioMap = new Map(prestiti.map((p, i) => [p.id, socie[i]]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Prestiti</h1>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">Richieste da approvare</h2>
        {inAttesa.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Nessuna richiesta in attesa.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {inAttesa.map((prestito) => (
              <div key={prestito.id} className="ticket-notch paper-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
                <div>
                  <p className="font-display text-lg text-ink">{prestito.gioco?.titolo}</p>
                  <p className="font-mono-tag text-xs text-ink/50">
                    {prestito.copia?.codice} · richiesto da {socioMap.get(prestito.id)?.nome} il {prestito.dataRichiesta}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={decidiPrestitoAction}>
                    <input type="hidden" name="prestitoId" value={prestito.id} />
                    <input type="hidden" name="decisione" value="approva" />
                    <button type="submit" className={`${btnPrimary} px-3.5 py-1.5 text-xs`}>
                      Approva
                    </button>
                  </form>
                  <form action={decidiPrestitoAction}>
                    <input type="hidden" name="prestitoId" value={prestito.id} />
                    <input type="hidden" name="decisione" value="rifiuta" />
                    <button type="submit" className={`${btnDanger} px-3.5 py-1.5 text-xs`}>
                      Rifiuta
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Prestiti in corso</h2>
        {inCorso.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Nessuna copia attualmente in prestito.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {inCorso.map((prestito) => (
              <div key={prestito.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink/10 bg-card p-4">
                <div>
                  <p className="font-display text-base text-ink">{prestito.gioco?.titolo}</p>
                  <p className="font-mono-tag text-xs text-ink/50">
                    {prestito.copia?.codice} · a {socioMap.get(prestito.id)?.nome} dal {prestito.dataApprovazione}
                  </p>
                </div>
                <form action={registraRientroAction}>
                  <input type="hidden" name="prestitoId" value={prestito.id} />
                  <button type="submit" className={`${btnPrimary} px-3.5 py-1.5 text-xs`}>
                    Registra rientro
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Storico completo</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-paper-soft text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-2.5">Gioco</th>
                <th className="px-4 py-2.5">Copia</th>
                <th className="px-4 py-2.5">Socio</th>
                <th className="px-4 py-2.5">Richiesto</th>
                <th className="px-4 py-2.5">Restituito</th>
                <th className="px-4 py-2.5">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {conclusi.map((prestito) => (
                <tr key={prestito.id}>
                  <td className="px-4 py-2.5">{prestito.gioco?.titolo}</td>
                  <td className="px-4 py-2.5 font-mono-tag">{prestito.copia?.codice}</td>
                  <td className="px-4 py-2.5">{socioMap.get(prestito.id)?.nome}</td>
                  <td className="px-4 py-2.5">{prestito.dataRichiesta}</td>
                  <td className="px-4 py-2.5">{prestito.dataRestituzioneEffettiva ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <BadgeStatoPrestito stato={prestito.stato} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
