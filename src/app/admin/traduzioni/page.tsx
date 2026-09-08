import { getTerminiAdmin } from "@/lib/data/terminiBgg";
import { ListaTerminiAdmin, PER_PAGINA_TERMINI } from "@/components/ListaTerminiAdmin";

export default async function AdminTraduzioniPage() {
  const [categorie, meccaniche] = await Promise.all([
    getTerminiAdmin({ tipo: "categoria", pagina: 1, perPagina: PER_PAGINA_TERMINI }),
    getTerminiAdmin({ tipo: "meccanica", pagina: 1, perPagina: PER_PAGINA_TERMINI }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono-tag text-xs uppercase tracking-widest text-ink/50">Area amministrazione</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Traduzioni categorie e meccaniche</h1>
      <p className="mt-2 text-sm text-ink/60">
        Corregge il testo tradotto da DeepL durante la sync BGG. La correzione si applica subito anche ai giochi
        già importati che usano il termine, e non viene più sovrascritta dalle sync successive. La descrizione
        (facoltativa) compare al hover/click sul chip categoria/meccanica nel catalogo e nel dettaglio gioco.
      </p>

      <ListaTerminiAdmin tipo="categoria" titolo="Categorie" terminiIniziali={categorie.termini} totaleIniziale={categorie.totale} />
      <ListaTerminiAdmin tipo="meccanica" titolo="Meccaniche" terminiIniziali={meccaniche.termini} totaleIniziale={meccaniche.totale} />

      {categorie.totale === 0 && meccaniche.totale === 0 && (
        <p className="mt-8 text-sm text-ink/60">
          Nessun termine tradotto ancora: verranno elencati qui dopo la prima sync BGG.
        </p>
      )}
    </div>
  );
}
