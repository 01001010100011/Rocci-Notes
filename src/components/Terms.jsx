import LegalLayout, { Section } from './LegalLayout'

const UPDATED = '27 settembre 2026'

export default function Terms() {
  return (
    <LegalLayout kicker="Condizioni d’uso" title="Termini e Condizioni" updated={UPDATED}>
      <p>
        Utilizzando Rocci Notes accetti i presenti Termini e Condizioni. Leggili con attenzione: se
        non sei d’accordo con una qualsiasi parte, ti invitiamo a non usare il servizio.
      </p>

      <Section heading="1. Il servizio">
        <p>
          Rocci Notes è una bacheca online che consente agli studenti di condividere appunti
          scolastici tramite un sistema di crediti virtuali: carichi i tuoi appunti, guadagni crediti
          quando vengono approvati, usi i crediti per scaricare quelli degli altri.
        </p>
      </Section>

      <Section heading="2. Account">
        <p>
          Sei responsabile della custodia delle credenziali del tuo account e di tutte le attività
          che vi si svolgono. Ti impegni a fornire dati veritieri e a non creare account multipli per
          eludere il sistema di crediti.
        </p>
      </Section>

      <Section heading="3. Crediti virtuali">
        <p>
          I crediti sono unità <strong>virtuali e prive di valore monetario</strong>: non sono
          denaro, non sono trasferibili, non possono essere venduti né convertiti in valuta. Servono
          soltanto a regolare lo scambio di appunti all’interno della piattaforma.
        </p>
      </Section>

      <Section heading="4. Contenuti caricati e dichiarazione di titolarità">
        <p>Caricando un appunto su Rocci Notes dichiari e garantisci che:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            il materiale è <strong>opera tua</strong>: appunti personali, sintesi, schemi o rielaborazioni
            frutto del tuo studio;
          </li>
          <li>
            ne detieni i diritti e la sua condivisione <strong>non viola diritti d’autore</strong>,
            marchi o altri diritti di terzi;
          </li>
          <li>
            non stai caricando interi libri di testo, dispense editoriali, verifiche protette,
            materiale riservato o comunque coperto da copyright altrui senza autorizzazione.
          </li>
        </ul>
        <p>
          <strong>Manleva:</strong> ti assumi la piena responsabilità dei contenuti che pubblichi e
          manlevi e tieni indenne Rocci Notes e il suo sviluppatore da qualsiasi pretesa, azione o
          richiesta di terzi — incluse violazioni del diritto d’autore — derivante dai materiali che
          hai caricato.
        </p>
        <p>
          Concedi a Rocci Notes una licenza non esclusiva, gratuita e limitata a ospitare, mostrare e
          distribuire i tuoi appunti agli altri utenti della piattaforma, esclusivamente per il
          funzionamento del servizio.
        </p>
      </Section>

      <Section heading="5. Antipirateria">
        <p>
          Ogni file scaricato viene marcato con un timbro personale (nome, email e data) che ne
          attesta l’uso personale. I documenti sono destinati allo <strong>studio personale</strong>:
          è vietata qualsiasi ulteriore diffusione pubblica o commerciale.
        </p>
      </Section>

      <Section heading="6. Moderazione">
        <p>
          Gli appunti pubblicati passano dalla revisione di un amministratore, che può approvarli,
          rifiutarli (indicandone il motivo) o eliminarli. Rocci Notes può rimuovere contenuti e
          sospendere account che violino questi Termini o che risultino inappropriati, senza
          preavviso.
        </p>
      </Section>

      <Section heading="7. Comportamenti vietati">
        <p>È vietato, a titolo esemplificativo:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>caricare contenuti illeciti, offensivi, discriminatori o non propri;</li>
          <li>manipolare o aggirare il sistema di crediti e voucher;</li>
          <li>tentare accessi non autorizzati, attacchi o abusi tecnici alla piattaforma;</li>
          <li>raccogliere dati di altri utenti (es. email) per fini non consentiti.</li>
        </ul>
      </Section>

      <Section heading="8. Limitazione di responsabilità">
        <p>
          Rocci Notes è fornito “così com’è”. Nei limiti consentiti dalla legge, lo sviluppatore non
          risponde di errori, interruzioni, perdita di dati o danni derivanti dall’uso del servizio,
          né dell’accuratezza o della liceità dei contenuti caricati dagli utenti, che restano di
          esclusiva responsabilità di chi li pubblica.
        </p>
      </Section>

      <Section heading="9. Esclusione di affiliazione (disclaimer)">
        <p>
          Rocci Notes è una <strong>piattaforma studentesca indipendente</strong>, creata e gestita
          da studenti. <strong>Non è affiliata, autorizzata, sponsorizzata né approvata</strong> da
          alcuna scuola, istituto, università, casa editrice o ente ufficiale. Eventuali nomi di
          istituti, docenti o marchi citati negli appunti appartengono ai rispettivi proprietari e sono
          usati a solo scopo informativo/didattico, senza alcun rapporto di endorsement.
        </p>
      </Section>

      <Section heading="10. Legge applicabile e modifiche">
        <p>
          Questi Termini sono regolati dalla legge italiana. Possono essere aggiornati nel tempo: la
          versione vigente è quella pubblicata su questa pagina. L’uso continuato del servizio dopo
          una modifica vale come accettazione.
        </p>
      </Section>

      <Section heading="11. Contatti">
        <p>
          Per domande su questi Termini scrivi a{' '}
          <a href="mailto:roccinotes@gmail.com" className="font-semibold text-copper">
            roccinotes@gmail.com
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  )
}
