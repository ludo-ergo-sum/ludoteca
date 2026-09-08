import {
  getPrestitiInAttesaConDettagli,
  getPrestitiInCorsoConDettagli,
  getStoricoPrestitiConDettagli,
} from "@/lib/data/enriched";
import { BottoneInvio } from "@/components/BottoneInvio";
import { decidiPrestitoAction, registraRientroAction } from "@/lib/actions/loans";
import { StoricoPrestiti, PER_PAGINA_STORICO_PRESTITI } from "@/components/StoricoPrestiti";
import { btnDanger, btnPrimary } from "@/lib/ui";

export default async function AdminPrestitiPage() {
  // "In attesa"/"in corso" restano query dirette non paginate (insieme di
  // lavoro operativo, per natura limitato): solo lo storico, che cresce per
  // sempre, e' paginato (vedi StoricoPrestiti).
  const [inAttesa, inCorso, storicoIniziale] = await Promise.all([
    getPrestitiInAttesaConDettagli(),
    getPrestitiInCorsoConDettagli(),
    getStoricoPrestitiConDettagli({ pagina: 1, perPagina: PER_PAGINA_STORICO_PRESTITI }),
  ]);

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
                    {prestito.copia?.codice} · richiesto da {prestito.socio?.nome} il {prestito.dataRichiesta}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={decidiPrestitoAction}>
                    <input type="hidden" name="prestitoId" value={prestito.id} />
                    <input type="hidden" name="decisione" value="approva" />
                    <BottoneInvio className={`${btnPrimary} px-3.5 py-1.5 text-xs`}>Approva</BottoneInvio>
                  </form>
                  <form action={decidiPrestitoAction}>
                    <input type="hidden" name="prestitoId" value={prestito.id} />
                    <input type="hidden" name="decisione" value="rifiuta" />
                    <BottoneInvio className={`${btnDanger} px-3.5 py-1.5 text-xs`}>Rifiuta</BottoneInvio>
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
                    {prestito.copia?.codice} · a {prestito.socio?.nome} dal {prestito.dataApprovazione}
                  </p>
                </div>
                <form action={registraRientroAction}>
                  <input type="hidden" name="prestitoId" value={prestito.id} />
                  <BottoneInvio className={`${btnPrimary} px-3.5 py-1.5 text-xs`}>Registra rientro</BottoneInvio>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Storico completo</h2>
        <StoricoPrestiti prestitiIniziali={storicoIniziale.prestiti} totaleIniziale={storicoIniziale.totale} />
      </section>
    </div>
  );
}
