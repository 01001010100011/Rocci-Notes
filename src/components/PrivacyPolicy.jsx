import LegalLayout, { Section } from './LegalLayout'

const UPDATED = '27 settembre 2026'

export default function PrivacyPolicy() {
  return (
    <LegalLayout kicker="Informativa privacy" title="Privacy Policy" updated={UPDATED}>
      <p>
        Questa informativa è resa ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) a
        chi utilizza Rocci Notes, la bacheca online dove gli studenti condividono appunti scolastici.
      </p>

      <Section heading="1. Titolare del trattamento">
        <p>
          Titolare del trattamento è Leo Riello, raggiungibile all’indirizzo email{' '}
          <a href="mailto:roccinotes@gmail.com" className="font-semibold text-copper">
            roccinotes@gmail.com
          </a>
          .
        </p>
      </Section>

      <Section heading="2. Dati che trattiamo">
        <p>Quando ti registri e usi la piattaforma raccogliamo:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Dati di autenticazione:</strong> indirizzo email e password (o account Google,
            se accedi con Google). La password non è memorizzata da Rocci Notes: è gestita in modo
            cifrato da Firebase Authentication (Google).
          </li>
          <li>
            <strong>Dati di profilo:</strong> un nickname che scegli tu, il ruolo (studente o admin)
            e contatori come crediti, appunti caricati e download effettuati.
          </li>
          <li>
            <strong>Contenuti caricati:</strong> i file (PDF o immagini) che pubblichi come appunti,
            archiviati su Cloudinary.
          </li>
          <li>
            <strong>Storico acquisti:</strong> l’elenco degli appunti che hai scaricato, per
            consentirti di riscaricarli gratis.
          </li>
          <li>
            <strong>Dati tecnici di sessione:</strong> il token di autenticazione di Firebase viene
            conservato nel localStorage del tuo browser per mantenerti collegato tra una visita e
            l’altra.
          </li>
        </ul>
        <p>
          Non raccogliamo dati particolari (art. 9 GDPR) né utilizziamo cookie di profilazione o
          pubblicitari.
        </p>
      </Section>

      <Section heading="3. Finalità e basi giuridiche">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Fornire il servizio</strong> (creare l’account, gestire crediti, pubblicare e
            scaricare appunti): esecuzione di un contratto / misure precontrattuali (art. 6.1.b).
          </li>
          <li>
            <strong>Sicurezza e prevenzione degli abusi</strong> (es. regole sui crediti e sui
            voucher): legittimo interesse (art. 6.1.f).
          </li>
          <li>
            <strong>Adempiere a obblighi di legge</strong>: art. 6.1.c, se necessario.
          </li>
        </ul>
      </Section>

      <Section heading="4. Cookie e archiviazione locale">
        <p>
          Rocci Notes usa esclusivamente <strong>storage tecnico essenziale</strong>: il
          localStorage del browser conserva il token di sessione Firebase (per non farti riaccedere
          a ogni pagina) e la tua scelta in merito al banner informativo. Non vengono impiegati
          cookie di tracciamento, statistica di terze parti o pubblicità. Per questo non è richiesto
          un consenso preventivo: si tratta di archiviazione necessaria al funzionamento del sito.
        </p>
      </Section>

      <Section heading="5. Servizi esterni (destinatari dei dati)">
        <p>I dati sono trattati tramite i seguenti fornitori:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Google Firebase</strong> (Authentication e Firestore) per account e database.
          </li>
          <li>
            <strong>Cloudinary</strong> per l’archiviazione e la distribuzione dei file caricati.
          </li>
          <li>
            <strong>GitHub Pages</strong> per l’hosting del sito.
          </li>
        </ul>
        <p>
          Alcuni di questi fornitori possono trattare dati su server fuori dall’Unione Europea, nel
          rispetto delle garanzie previste dal GDPR (es. Clausole Contrattuali Standard e, ove
          applicabile, il Data Privacy Framework UE-USA).
        </p>
      </Section>

      <Section heading="6. Conservazione">
        <p>
          I dati dell’account sono conservati finché l’account resta attivo. Gli appunti rifiutati
          dall’admin vengono eliminati automaticamente 7 giorni dopo il rifiuto. Alla cancellazione
          dell’account i dati personali vengono rimossi, salvo obblighi di legge che ne impongano la
          conservazione.
        </p>
      </Section>

      <Section heading="7. I tuoi diritti">
        <p>
          Puoi esercitare in qualsiasi momento i diritti previsti dagli artt. 15-22 GDPR: accesso,
          rettifica, cancellazione, limitazione, opposizione e portabilità dei dati. Per farlo,
          scrivi a{' '}
          <a href="mailto:roccinotes@gmail.com" className="font-semibold text-copper">
            roccinotes@gmail.com
          </a>
          . Hai inoltre diritto di proporre reclamo al Garante per la Protezione dei Dati Personali
          (www.garanteprivacy.it).
        </p>
      </Section>

      <Section heading="8. Cancellazione dell’account">
        <p>
          Per eliminare il tuo account e tutti i dati associati, invia una richiesta da un indirizzo
          email verificabile a{' '}
          <a href="mailto:roccinotes@gmail.com" className="font-semibold text-copper">
            roccinotes@gmail.com
          </a>{' '}
          con oggetto “Cancellazione account Rocci Notes”. Provvederemo senza ingiustificato ritardo.
        </p>
      </Section>

      <Section heading="9. Minori">
        <p>
          Il servizio è pensato per studenti. Se sei minorenne, ti invitiamo a utilizzare Rocci Notes
          con il consenso e la supervisione di un genitore o tutore.
        </p>
      </Section>

      <Section heading="10. Modifiche">
        <p>
          Questa informativa può essere aggiornata nel tempo: la versione vigente è quella pubblicata
          su questa pagina, con la data di aggiornamento indicata in alto.
        </p>
      </Section>
    </LegalLayout>
  )
}
