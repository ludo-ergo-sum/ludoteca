import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di servizio",
};

export default function PaginaTerminiDiServizio() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-ink/80 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Termini di servizio</h1>
      <p className="mt-2 text-xs text-ink/50">Ultimo aggiornamento: 16 novembre 2026</p>

      <p className="mt-6">
        Il sito e il servizio di ludoteca sono gestiti da Ludo Ergo Sum, associazione senza scopo di lucro con sede in
        Via Foce 40, 18100 Imperia (IM). Utilizzando il sito accetti le condizioni che seguono.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">1. Chi può usare il servizio</h2>
      <p className="mt-2">
        Il catalogo dei giochi è consultabile da chiunque. La prenotazione e il prestito dei giochi sono riservati alle
        socie e ai soci in regola con la quota associativa annuale, registrata dalla segreteria. Ogni account è
        personale e non può essere ceduto.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">2. Prestiti</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          Una richiesta di prestito diventa effettiva solo dopo l&apos;approvazione della segreteria. La data di
          scadenza del prestito è indicata al momento dell&apos;approvazione (circa 360 giorni).
        </li>
        <li>
          Dal ritiro alla restituzione il socio è responsabile della copia ricevuta, che va usata con cura e restituita
          nelle condizioni in cui è stata affidata.
        </li>
        <li>
          In caso di danno o smarrimento il socio ne dà tempestiva comunicazione alla segreteria. Le modalità di
          eventuale ripristino o rimborso sono stabilite dal regolamento interno. [Da definire: importi e procedura.]
        </li>
        <li>
          La restituzione è registrata dalla segreteria. Fino a quel momento la copia risulta in carico al socio.
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">3. Contenuti inseriti dai soci</h2>
      <p className="mt-2">
        Voti, commenti, preferiti e richieste di acquisto devono essere rispettosi e pertinenti. È vietato pubblicare
        contenuti offensivi, illeciti o che violino diritti di terzi. L&apos;associazione può rimuovere in qualsiasi
        momento i contenuti non conformi, e può sospendere o eliminare l&apos;account di chi violi queste condizioni o
        il regolamento dell&apos;associazione.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">4. Informazioni sui giochi</h2>
      <p className="mt-2">
        Titoli, descrizioni, immagini e valutazioni dei giochi provengono da BoardGameGeek e restano di proprietà dei
        rispettivi titolari. Ludo Ergo Sum non è affiliata a BoardGameGeek. Le informazioni sono fornite a scopo
        informativo e possono non essere aggiornate o complete.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">5. Disponibilità del servizio</h2>
      <p className="mt-2">
        Il servizio è offerto senza garanzie di continuità. Possiamo modificarlo, sospenderlo o interromperlo, anche
        temporaneamente, per manutenzione o per ragioni organizzative, dandone comunicazione quando possibile.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">6. Protezione dei dati</h2>
      <p className="mt-2">
        Il trattamento dei dati personali è descritto nell&apos;
        <a href="/privacy" className="underline hover:text-felt">
          informativa sulla privacy
        </a>
        , che fa parte integrante di queste condizioni.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">7. Modifiche alle condizioni</h2>
      <p className="mt-2">
        Queste condizioni possono essere aggiornate. La versione in vigore è quella pubblicata su questa pagina, con la
        data di ultimo aggiornamento.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">8. Legge applicabile e contatti</h2>
      <p className="mt-2">
        Per queste condizioni si applica la legge italiana. Per ogni controversia è competente il foro previsto dalla
        legge, fatti salvi i diritti inderogabili dei consumatori. Per informazioni: [Da compilare: email di contatto].
      </p>
    </article>
  );
}
