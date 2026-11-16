import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PaginaPrivacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-ink/80 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Informativa sulla privacy</h1>
      <p className="mt-2 text-xs text-ink/50">Ultimo aggiornamento: 16 novembre 2026</p>

      <p className="mt-6">
        La presente informativa descrive come Ludo Ergo Sum tratta i dati personali di chi utilizza il sito e il
        servizio di ludoteca, ai sensi del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">1. Titolare del trattamento</h2>
      <p className="mt-2">
        Ludo Ergo Sum, associazione senza scopo di lucro, Via Foce 40, 18100 Imperia (IM).
        <br />
        Email di contatto: [da compilare]
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">2. Dati trattati</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          <strong>Dati dell&apos;account Google</strong> (al primo accesso): nome, indirizzo email, immagine del profilo
          e identificativo dell&apos;account Google. Non riceviamo la password.
        </li>
        <li>
          <strong>Dati associativi</strong>: data di iscrizione, storico delle quote annuali registrate dalla
          segreteria, prestiti, preferiti, voti e commenti sui giochi, richieste di acquisto di nuovi giochi.
        </li>
        <li>
          <strong>Dati tecnici</strong>: il cookie di sessione, strettamente necessario per restare autenticati, e la
          preferenza di tema grafico salvata nel browser. Non utilizziamo cookie di profilazione né strumenti di
          analisi di terze parti.
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">3. Finalità e base giuridica</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          Gestione del rapporto associativo e del servizio di prestito dei giochi (esecuzione del rapporto, art. 6.1.b
          GDPR).
        </li>
        <li>
          Adempimenti amministrativi e fiscali previsti dalla legge per le associazioni (obbligo legale, art. 6.1.c
          GDPR).
        </li>
        <li>
          Invio di comunicazioni di servizio: conferma di registrazione, esito delle richieste di prestito, promemoria
          di restituzione. Non inviamo comunicazioni promozionali.
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">4. Destinatari dei dati</h2>
      <p className="mt-2">
        I dati sono accessibili alla segreteria e agli amministratori dell&apos;associazione, nei limiti delle proprie
        funzioni. Per erogare il servizio ci avvaliamo di fornitori che trattano i dati per nostro conto:
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>Google, per l&apos;autenticazione tramite account Google;</li>
        <li>MongoDB, per la conservazione del database;</li>
        <li>Vercel, per l&apos;hosting dell&apos;applicazione;</li>
        <li>Resend, per l&apos;invio delle email di servizio.</li>
      </ul>
      <p className="mt-2">
        I dati non vengono venduti né ceduti a terzi per finalità proprie. Il servizio di traduzione dei testi dei
        giochi non riceve dati personali.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">5. Conservazione</h2>
      <p className="mt-2">
        I dati dell&apos;account e dello storico associativo sono conservati finché il socio resta iscritto e, dopo
        la cessazione, per il tempo necessario agli adempimenti di legge. [Da definire: tempi precisi di conservazione
        e procedura di cancellazione dell&apos;account su richiesta.]
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">6. Diritti dell&apos;interessato</h2>
      <p className="mt-2">
        Puoi chiedere al titolare l&apos;accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del
        trattamento, la portabilità e opporti al trattamento, nei casi previsti dagli artt. 15-22 del GDPR, scrivendo
        all&apos;indirizzo indicato al punto 1. Hai inoltre diritto di proporre reclamo al Garante per la protezione
        dei dati personali (www.garanteprivacy.it).
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">7. Modifiche</h2>
      <p className="mt-2">
        La presente informativa può essere aggiornata. La versione in vigore è sempre quella pubblicata su questa
        pagina.
      </p>
    </article>
  );
}
