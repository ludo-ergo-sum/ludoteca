import { getImpostazioniEmail, getTuttiITemplateEmail } from "@/lib/data/emailTemplates";
import { salvaImpostazioniEmailAction, salvaTemplateEmailAction } from "@/lib/actions/emailTemplates";
import { CampoTemplateEmail } from "@/components/CampoTemplateEmail";
import type { ChiaveEmail } from "@/lib/types";
import { btnOutline, inputBase, labelBase } from "@/lib/ui";

const TITOLI: Record<ChiaveEmail, string> = {
  benvenuto: "Benvenuto nuovo socio",
  nuovaRichiesta: "Nuova richiesta di prestito (agli admin)",
  decisionePrestito: "Decisione sulla richiesta (al socio)",
  promemoria: "Promemoria di restituzione (al socio)",
  nuovaRichiestaAcquisto: "Richiesta d'acquisto espansione (agli admin)",
};

const SEGNAPOSTO: Record<ChiaveEmail, string[]> = {
  benvenuto: ["nome"],
  nuovaRichiesta: ["giocoTitolo", "socioNome"],
  decisionePrestito: ["nome", "giocoTitolo", "risultato", "esito", "nota"],
  promemoria: ["nome", "giocoTitolo", "dataScadenza"],
  nuovaRichiestaAcquisto: ["socioNome", "espansioneTitolo", "giocoBaseTitolo", "messaggio"],
};

export default async function AdminEmailPage() {
  const [impostazioni, template] = await Promise.all([getImpostazioniEmail(), getTuttiITemplateEmail()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Testi delle email</h1>
      <p className="mt-2 text-sm text-ink/60">
        Testo semplice: una riga vuota separa i paragrafi, niente HTML da scrivere a mano. I pulsanti sotto ogni
        campo inseriscono il segnaposto alla posizione del cursore.
      </p>

      <section className="paper-card mt-8 rounded-2xl p-5">
        <p className="font-display text-lg text-ink">Intestazione e piè di pagina</p>
        <p className="text-xs text-ink/50">Comuni a tutte le email qui sotto.</p>
        <form action={salvaImpostazioniEmailAction} className="mt-4 space-y-4">
          <div>
            <label className={labelBase} htmlFor="intestazione">
              Intestazione
            </label>
            <CampoTemplateEmail id="intestazione" name="intestazione" defaultValue={impostazioni.intestazione} righe={2} />
          </div>
          <div>
            <label className={labelBase} htmlFor="piePagina">
              Piè di pagina
            </label>
            <CampoTemplateEmail id="piePagina" name="piePagina" defaultValue={impostazioni.piePagina} righe={2} />
          </div>
          <button type="submit" className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
            Salva
          </button>
        </form>
      </section>

      <div className="mt-8 space-y-5">
        {template.map((t) => (
          <section key={t.chiave} className="paper-card rounded-2xl p-5">
            <p className="font-display text-lg text-ink">{TITOLI[t.chiave]}</p>
            <form action={salvaTemplateEmailAction} className="mt-4 space-y-4">
              <input type="hidden" name="chiave" value={t.chiave} />
              <div>
                <label className={labelBase} htmlFor={`oggetto-${t.chiave}`}>
                  Oggetto
                </label>
                <input
                  id={`oggetto-${t.chiave}`}
                  name="oggetto"
                  defaultValue={t.oggetto}
                  className={`${inputBase} font-mono-tag text-xs`}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor={`corpo-${t.chiave}`}>
                  Corpo
                </label>
                <CampoTemplateEmail
                  id={`corpo-${t.chiave}`}
                  name="corpo"
                  defaultValue={t.corpo}
                  segnaposto={SEGNAPOSTO[t.chiave]}
                />
              </div>
              <button type="submit" className={`${btnOutline} px-3.5 py-1.5 text-xs`}>
                Salva
              </button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
