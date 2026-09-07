import { getSocie } from "@/lib/data/users";
import { getUtenteCorrente } from "@/lib/session";
import { EliminaSocioButton } from "@/components/EliminaSocioButton";
import { BottoneInvio } from "@/components/BottoneInvio";
import { ListaSocieQuote } from "@/components/ListaSocieQuote";
import { impostaRuoloAction } from "@/lib/actions/users";
import { btnOutline } from "@/lib/ui";

export default async function AdminSociePage() {
  const [tutti, utenteCorrente] = await Promise.all([getSocie(), getUtenteCorrente()]);
  const admin = tutti.filter((u) => u.ruolo === "admin");
  // Un admin e' anche un socio: compare qui sotto pure lui, cosi' la sua
  // quota si rinnova dal pannello come per chiunque altro, senza toccare il
  // database a mano.
  const socie = tutti;
  const annoCorrente = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Socie e quote associative</h1>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">Amministratori</h2>
        <div className="mt-3 space-y-2">
          {admin.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-card p-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{a.nome}</p>
                <p className="text-xs text-ink/50">{a.email}</p>
              </div>
              {a.id !== utenteCorrente?.id && (
                <div className="flex items-center gap-2">
                  <form action={impostaRuoloAction}>
                    <input type="hidden" name="utenteId" value={a.id} />
                    <input type="hidden" name="ruolo" value="socio" />
                    <BottoneInvio className={`${btnOutline} px-3.5 py-1.5 text-xs`}>Retrocedi a socio</BottoneInvio>
                  </form>
                  <EliminaSocioButton utenteId={a.id} nome={a.nome} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">Socie e quote</h2>
      <ListaSocieQuote socie={socie} annoCorrente={annoCorrente} />
    </div>
  );
}
