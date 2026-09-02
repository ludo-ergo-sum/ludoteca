import Link from "next/link";
import { redirect } from "next/navigation";
import { getUtenteCorrente } from "@/lib/session";
import { getGiochiPreferitiByUtente, getPrestitiUtenteConDettagli } from "@/lib/data/enriched";
import { getRecensioniByUtente } from "@/lib/data/recensioni";
import { BadgeSocioInRegola } from "@/components/StatusBadge";
import { StoricoQuote } from "@/components/StoricoQuote";
import { TabsPrestiti } from "@/components/TabsPrestiti";

export default async function ProfiloPage() {
  const utente = await getUtenteCorrente();
  if (!utente) redirect("/login?callbackUrl=/profilo");

  const [prestiti, preferiti, recensioni] = await Promise.all([
    getPrestitiUtenteConDettagli(utente.id),
    getGiochiPreferitiByUtente(utente.id),
    getRecensioniByUtente(utente.id),
  ]);
  const attivi = prestiti.filter((p) => p.stato === "in_attesa" || p.stato === "approvato" || p.stato === "in_corso");
  const storico = prestiti.filter((p) => !attivi.includes(p));
  const giochiRecensiti = recensioni.map((r) => r.giocoId);
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

        <p className="mt-3 text-sm text-ink/70">
          {quotaCorrente?.inRegola
            ? `In regola${quotaCorrente.dataRegistrazione ? ` dal ${quotaCorrente.dataRegistrazione}` : ""}.`
            : "Non risulti in regola per l'anno in corso: contatta la segreteria."}
        </p>

        {utente.quote.length > 0 && (
          <div className="mt-4">
            <StoricoQuote quote={utente.quote} />
          </div>
        )}
      </section>

      {preferiti.length > 0 && (
        <section className="paper-card mt-7 rounded-2xl p-6">
          <p className="font-mono-tag text-[11px] uppercase tracking-widest text-ink/50">Giochi preferiti</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {preferiti.map(({ gioco }) => (
              <Link
                key={gioco.id}
                href={`/giochi/${gioco.slug}`}
                className="rounded-full border border-ink/15 px-3 py-1.5 text-sm text-ink transition hover:border-felt hover:text-felt"
              >
                {gioco.titolo}
              </Link>
            ))}
          </div>
        </section>
      )}

      <TabsPrestiti attivi={attivi} storico={storico} giochiRecensiti={giochiRecensiti} />
    </div>
  );
}
