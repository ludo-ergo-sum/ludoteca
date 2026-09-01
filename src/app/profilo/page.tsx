import { redirect } from "next/navigation";
import { CalendarClock, Ticket } from "lucide-react";
import { getUtenteCorrente } from "@/lib/session";
import { getPrestitiUtenteConDettagli } from "@/lib/data/enriched";
import { BadgeSocioInRegola, BadgeStatoPrestito } from "@/components/StatusBadge";
import { annullaPrestitoAction } from "@/lib/actions/loans";
import { btnOutline } from "@/lib/ui";

export default async function ProfiloPage() {
  const utente = await getUtenteCorrente();
  if (!utente) redirect("/login?callbackUrl=/profilo");

  const prestiti = await getPrestitiUtenteConDettagli(utente.id);
  const attivi = prestiti.filter((p) => p.stato === "in_attesa" || p.stato === "approvato" || p.stato === "in_corso");
  const storico = prestiti.filter((p) => !attivi.includes(p));
  const quoteOrdinate = [...utente.quote].sort((a, b) => b.anno - a.anno);
  const annoCorrente = new Date().getFullYear();
  const quotaCorrente = utente.quote.find((q) => q.anno === annoCorrente);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div>
        <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Tessera socio</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{utente.nome}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {utente.email} · socio dal {utente.dataIscrizione}
        </p>
      </div>

      <section className="paper-card mt-7 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">
            Quota associativa {annoCorrente}
          </p>
          <BadgeSocioInRegola inRegola={quotaCorrente?.inRegola ?? false} />
        </div>

        <ul className="mt-4 divide-y divide-dashed divide-ink/15">
          {quoteOrdinate.length === 0 && <p className="py-3 text-sm text-ink/60">Nessuna quota registrata ancora.</p>}
          {quoteOrdinate.map((quota) => (
            <li key={quota.anno} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="font-display text-lg text-ink">{quota.anno}</span>
              <BadgeSocioInRegola inRegola={quota.inRegola} />
              <span className="font-mono-tag text-xs text-ink/50">
                {quota.dataRegistrazione ? `registrata il ${quota.dataRegistrazione}` : "non registrata"}
              </span>
              {quota.note && <span className="w-full text-xs text-ink/50">{quota.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Ticket size={18} /> Prestiti in corso e richieste
        </h2>
        {attivi.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Non hai prestiti attivi in questo momento.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {attivi.map((prestito) => (
              <div key={prestito.id} className="ticket-notch paper-card flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div>
                  <p className="font-display text-lg text-ink">{prestito.gioco?.titolo ?? "Gioco"}</p>
                  <p className="font-mono-tag text-xs text-ink/50">
                    {prestito.copia?.codice} · richiesto il {prestito.dataRichiesta}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeStatoPrestito stato={prestito.stato} />
                  {prestito.stato === "in_attesa" && (
                    <form action={annullaPrestitoAction}>
                      <input type="hidden" name="prestitoId" value={prestito.id} />
                      <button type="submit" className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
                        Annulla richiesta
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <CalendarClock size={18} /> Storico prestiti
        </h2>
        {storico.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Ancora nessun prestito concluso.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {storico.map((prestito) => (
              <div key={prestito.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-card/60 p-4">
                <div>
                  <p className="font-display text-base text-ink">{prestito.gioco?.titolo ?? "Gioco"}</p>
                  <p className="font-mono-tag text-xs text-ink/50">
                    {prestito.copia?.codice} · richiesto il {prestito.dataRichiesta}
                    {prestito.dataRestituzioneEffettiva && ` · restituito il ${prestito.dataRestituzioneEffettiva}`}
                  </p>
                </div>
                <BadgeStatoPrestito stato={prestito.stato} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
