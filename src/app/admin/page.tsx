import Link from "next/link";
import { Dices, PauseCircle, Stamp, Tag, UserX } from "lucide-react";
import { getGiochi } from "@/lib/data/games";
import { getCopieSenzaEtichetta, getTutteLeCopie } from "@/lib/data/copies";
import { getPrestitiInAttesa } from "@/lib/data/loans";
import { getSocie, socioInRegolaPerAnno } from "@/lib/data/users";

export default async function AdminDashboard() {
  const [giochi, copie, copieSenzaEtichetta, inAttesa, socie] = await Promise.all([
    getGiochi(),
    getTutteLeCopie(),
    getCopieSenzaEtichetta(),
    getPrestitiInAttesa(),
    getSocie(),
  ]);
  const annoCorrente = new Date().getFullYear();
  const offline = copie.filter((c) => c.stato === "offline");
  const nonInRegola = socie.filter((s) => s.ruolo === "socio" && !socioInRegolaPerAnno(s, annoCorrente));

  const riquadri = [
    {
      href: "/admin/prestiti",
      icona: Stamp,
      titolo: "Richieste da approvare",
      valore: inAttesa.length,
      nota: "prestiti in attesa",
    },
    {
      href: "/admin/giochi",
      icona: Dices,
      titolo: "Catalogo",
      valore: giochi.length,
      nota: `${copie.length} copie totali`,
    },
    {
      href: "/admin/giochi",
      icona: PauseCircle,
      titolo: "Copie fuori linea",
      valore: offline.length,
      nota: "da verificare",
    },
    {
      href: "/admin/giochi",
      icona: Tag,
      titolo: "Etichette da stampare",
      valore: copieSenzaEtichetta.length,
      nota: "copie senza etichetta",
    },
    {
      href: "/admin/socie",
      icona: UserX,
      titolo: "Socie da rinnovare",
      valore: nonInRegola.length,
      nota: `quota ${annoCorrente}`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Il banco della segreteria</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {riquadri.map(({ href, icona: Icona, titolo, valore, nota }) => (
          <Link key={titolo} href={href} className="hover-lift paper-card rounded-2xl p-5">
            <Icona size={18} className="text-felt" />
            <p className="mt-3 font-display text-3xl text-ink">{valore}</p>
            <p className="mt-1 text-sm font-medium text-ink">{titolo}</p>
            <p className="text-xs text-ink/50">{nota}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/giochi" className="underline hover:text-felt">
          Gestisci giochi e copie
        </Link>
        <span className="text-ink/30">·</span>
        <Link href="/admin/prestiti" className="underline hover:text-felt">
          Gestisci prestiti
        </Link>
        <span className="text-ink/30">·</span>
        <Link href="/admin/socie" className="underline hover:text-felt">
          Gestisci socie e quote
        </Link>
      </div>
    </div>
  );
}
