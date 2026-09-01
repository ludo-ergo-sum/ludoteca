import Link from "next/link";
import { Dice5, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { auth, signOut } from "@/auth";
import { btnAmber, btnSmall } from "@/lib/ui";

export async function Navbar() {
  const session = await auth();
  const utente = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-felt text-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber text-ink">
            <Dice5 size={20} strokeWidth={2.25} />
          </span>
          <span className="font-display text-lg font-semibold leading-tight">
            Ludo Ergo Sum
            <span className="block font-body text-[11px] font-normal uppercase tracking-[0.14em] text-card/70">
              Ludoteca associativa
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="hidden rounded-full px-3 py-2 text-sm font-medium text-card/85 hover:bg-white/10 sm:inline-block">
            Catalogo giochi
          </Link>

          {utente?.ruolo === "admin" && (
            <Link href="/admin" className={`${btnSmall} bg-amber text-ink hover:bg-amber-strong`}>
              <ShieldCheck size={14} /> Area admin
            </Link>
          )}

          {utente ? (
            <>
              <Link href="/profilo" className={`${btnSmall} border border-card/30 text-card hover:bg-white/10`}>
                <UserRound size={14} /> {utente.name?.split(" ")[0] ?? "Profilo"}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className={`${btnSmall} text-card/80 hover:bg-white/10`} aria-label="Esci">
                  <LogOut size={14} />
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={btnAmber}>
              Accedi
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
