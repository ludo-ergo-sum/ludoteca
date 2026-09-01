import Link from "next/link";
import { Dice5, FlaskConical } from "lucide-react";
import { signIn } from "@/auth";
import { getSocie } from "@/lib/data/users";
import { btnOutline, btnPrimary } from "@/lib/ui";

const devLoginAttivo = process.env.ENABLE_DEV_LOGIN === "true";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  const destinazione = typeof callbackUrl === "string" ? callbackUrl : "/profilo";
  const utenti = devLoginAttivo ? await getSocie() : [];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-felt text-card">
        <Dice5 size={28} />
      </span>
      <h1 className="font-display text-3xl font-semibold text-ink">Accedi come socio</h1>
      <p className="mt-3 text-sm text-ink/70">
        Usa il tuo account Google per accedere: al primo accesso la tua tessera socio viene creata
        automaticamente. Potrai prenotare i giochi non appena la segreteria registra la quota associativa.
      </p>

      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: destinazione });
        }}
      >
        <button type="submit" className={btnPrimary}>
          Continua con Google
        </button>
      </form>

      <p className="mt-6 text-xs text-ink/50">
        Sei solo curioso? Puoi <Link href="/" className="underline hover:text-felt">sfogliare il catalogo</Link> anche senza accedere.
      </p>

      {devLoginAttivo && (
        <div className="mt-10 w-full rounded-2xl border border-dashed border-amber/50 bg-amber/10 p-5 text-left">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-strong">
            <FlaskConical size={14} /> Accesso di sviluppo
          </p>
          <p className="mt-1.5 text-xs text-ink/60">
            Solo in questo ambiente: entra come uno degli utenti mock senza passare da Google.
          </p>
          <div className="mt-3 space-y-2">
            {utenti.map((utente) => (
              <form
                key={utente.id}
                action={async () => {
                  "use server";
                  await signIn("dev-login", { utenteId: utente.id, redirectTo: destinazione });
                }}
              >
                <button type="submit" className={`${btnOutline} w-full justify-between text-xs`}>
                  <span>{utente.nome}</span>
                  <span className="text-ink/40">{utente.ruolo}</span>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
