import { getRichiesteAcquistoConDettagli } from "@/lib/data/enriched";
import { segnaRichiestaGestitaAction } from "@/lib/actions/richiesteAcquisto";
import { btnPrimary } from "@/lib/ui";

export default async function AdminRichiesteAcquistoPage() {
  const richieste = await getRichiesteAcquistoConDettagli();
  const nuove = richieste.filter((r) => r.stato === "nuova");
  const gestite = richieste.filter((r) => r.stato === "gestita");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Richieste d&apos;acquisto</h1>
      <p className="mt-2 text-sm text-ink/60">
        Espansioni segnalate dalle socie e dai soci perché non presenti in ludoteca.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">Nuove richieste</h2>
        {nuove.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Nessuna richiesta da valutare.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {nuove.map((richiesta) => (
              <div
                key={richiesta.id}
                className="ticket-notch paper-card flex flex-wrap items-start justify-between gap-4 rounded-xl p-4"
              >
                <div>
                  <p className="font-display text-lg text-ink">{richiesta.titolo}</p>
                  <p className="font-mono-tag text-xs text-ink/50">
                    espansione di {richiesta.giocoBaseTitolo} · segnalata da {richiesta.autoreNome} il{" "}
                    {richiesta.data}
                  </p>
                  {richiesta.messaggio && <p className="mt-2 text-sm text-ink/70">{richiesta.messaggio}</p>}
                </div>
                <form action={segnaRichiestaGestitaAction}>
                  <input type="hidden" name="id" value={richiesta.id} />
                  <button type="submit" className={`${btnPrimary} px-3.5 py-1.5 text-xs`}>
                    Segna come gestita
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Storico</h2>
        {gestite.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Nessuna richiesta gestita ancora.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-paper-soft text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-2.5">Espansione</th>
                  <th className="px-4 py-2.5">Gioco base</th>
                  <th className="px-4 py-2.5">Socio</th>
                  <th className="px-4 py-2.5">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {gestite.map((richiesta) => (
                  <tr key={richiesta.id}>
                    <td className="px-4 py-2.5">{richiesta.titolo}</td>
                    <td className="px-4 py-2.5">{richiesta.giocoBaseTitolo}</td>
                    <td className="px-4 py-2.5">{richiesta.autoreNome}</td>
                    <td className="px-4 py-2.5">{richiesta.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
