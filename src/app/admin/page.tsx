import Link from "next/link";
import { Dices, PauseCircle, ShoppingCart, Stamp, Tag, UserX } from "lucide-react";
import { getStatisticheCatalogo } from "@/lib/data/games";
import { contaCopieOffline, contaCopieSenzaEtichetta } from "@/lib/data/copies";
import { contaPrestitiInAttesa } from "@/lib/data/loans";
import { contaRichiesteNuove } from "@/lib/data/richiesteAcquisto";
import { contaSocieNonInRegola } from "@/lib/data/users";

export default async function AdminDashboard() {
  const annoCorrente = new Date().getFullYear();
  // Ogni riquadro e' un countDocuments (o una query mirata), mai un
  // find()/toArray() dell'intera collezione per farne poi .length.
  const [statisticheCatalogo, copieOffline, copieSenzaEtichetta, prestitiInAttesa, richiesteNuove, socieNonInRegola] =
    await Promise.all([
      getStatisticheCatalogo(),
      contaCopieOffline(),
      contaCopieSenzaEtichetta(),
      contaPrestitiInAttesa(),
      contaRichiesteNuove(),
      // Un admin e' anche un socio ed e' soggetto alla stessa quota (vedi
      // /admin/socie): contaSocieNonInRegola non filtra sul ruolo, altrimenti
      // un admin non in regola non verrebbe mai contato qui.
      contaSocieNonInRegola(annoCorrente),
    ]);

  const riquadri = [
    {
      href: "/admin/prestiti",
      icona: Stamp,
      titolo: "Richieste da approvare",
      valore: prestitiInAttesa,
      nota: "prestiti in attesa",
    },
    {
      href: "/admin/giochi",
      icona: Dices,
      titolo: "Catalogo",
      valore: statisticheCatalogo.totaleGiochi,
      nota: `${statisticheCatalogo.copieTotali} copie totali`,
    },
    {
      href: "/admin/giochi",
      icona: PauseCircle,
      titolo: "Copie fuori linea",
      valore: copieOffline,
      nota: "da verificare",
    },
    {
      href: "/admin/giochi",
      icona: Tag,
      titolo: "Etichette da stampare",
      valore: copieSenzaEtichetta,
      nota: "copie senza etichetta",
    },
    {
      href: "/admin/richieste-acquisto",
      icona: ShoppingCart,
      titolo: "Richieste d'acquisto",
      valore: richiesteNuove,
      nota: "da valutare",
    },
    {
      href: "/admin/socie",
      icona: UserX,
      titolo: "Socie da rinnovare",
      valore: socieNonInRegola,
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
