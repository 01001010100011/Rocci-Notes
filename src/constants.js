export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const SUPER_ADMIN_EMAIL = 'leoriellooo@gmail.com'

export const ADMIN_EMAILS = [
  SUPER_ADMIN_EMAIL,
  'federicafan09@gmail.com',
  'fmillesimi@gmail.com',
]

// Gerarchia ruoli: superadmin (solo email) > admin > helper > user.
// I documenti storici usano 'student' per l'utente standard: normalizeRole lo
// riporta a 'user' senza migrazioni sul database.
export const ROLE_SUPERADMIN = 'superadmin'
export const ROLE_ADMIN = 'admin'
export const ROLE_HELPER = 'helper'
export const ROLE_USER = 'user'

export const ROLE_LABELS = {
  [ROLE_USER]: 'User',
  [ROLE_HELPER]: 'Helper',
  [ROLE_ADMIN]: 'Admin',
  [ROLE_SUPERADMIN]: 'Super Admin',
}

export function normalizeRole(raw) {
  if (raw === ROLE_ADMIN) return ROLE_ADMIN
  if (raw === ROLE_HELPER) return ROLE_HELPER
  if (raw === ROLE_SUPERADMIN) return ROLE_SUPERADMIN
  return ROLE_USER
}

export const ACCOUNT_SUSPENDED_TITLE = 'Account Sospeso'

export const ACCOUNT_SUSPENDED_MESSAGE =
  'Il tuo account è stato temporaneamente o definitivamente disabilitato per violazione delle linee guida della piattaforma. Se ritieni si tratti di un errore, contatta roccinotes@gmail.com'

export const VOUCHER_INVALID_MESSAGE = 'Codice non valido'

export const VOUCHER_ALREADY_USED_MESSAGE = 'Hai già riscattato questo codice in passato'

export const VOUCHER_EXHAUSTED_MESSAGE =
  'Codice esaurito! Il limite massimo di riscatti è stato raggiunto'

export const FILE_TOO_LARGE_MESSAGE =
  'Il file è troppo grande. Il limite massimo è di 10 MB.'

export const UPLOAD_SUCCESS_MESSAGE =
  'Appunto inviato! Riceverai 1 credito quando un admin lo approverà.'

export const INSUFFICIENT_CREDITS_MESSAGE =
  'Crediti insufficienti! Carica un nuovo appunto per guadagnare crediti.'

export const REJECTION_TTL_DAYS = 7

export const REJECTION_TTL_BANNER =
  'Gli appunti rifiutati vengono eliminati automaticamente 7 giorni dopo il rifiuto.'

export const SUBJECTS = [
  'Matematica',
  'Italiano',
  'Storia',
  'Geografia',
  'Inglese',
  'Scienze',
  'Fisica',
  'Chimica',
  'Latino',
  'Filosofia',
  'Informatica',
  'Arte',
  'Educazione civica',
  'Altro',
]

export const REQUIRED_FIELDS_MESSAGE =
  'Compila tutti i campi obbligatori prima di pubblicare.'

export const PROFESSORI = [
  'ALESSI G.', 'ANGELONI A.', 'ANGIONE E.', 'ANTONELLI G.', 'ASCANI A.G.',
  'BALICCHI B.', 'BALOSSI RESTELLI S.', 'BERNARDINETTI A.', 'BETTINELLI L.',
  'BIANCHI V.', 'CAGNIZI D.', 'CARROZZONI L.', 'CASCIANI N.', 'CERRONI A.',
  'CHIARETTI D.', 'COCCIA L.', 'COLAPIETRO M.', 'COLASANTI S.', 'COLLU A.',
  'CORRADI N.', 'DE MARCO A.', 'FERRANTE M.G.', 'FICORILLI M.', 'FILAURO G.',
  'FOTI M.L.', 'FRANCHI A.', 'FRANCO A.', 'FUSI P.', 'GUANA M.E.',
  'GUARRATO I.', 'HOLST M.', 'IANNONE L.', 'LONGHI L.', 'LUCIANI D.',
  'LUCANTONI A.', 'MACRÌ C.', 'MANCINI M.', 'MAOLI', 'MARERI L.',
  'MARRERO G.A.I.', 'MARTINI G.', 'MARTUCCI V.', 'MELIS A.', 'MIRRIONE S.',
  'MOSTARDA F.', 'NICOLETTI B.', 'NOVELLI F.', 'ORSINI C.', 'PANTANI M.',
  'PARIS A.', 'PAVESI F.', 'PETRUCCI C.', 'PIZZOLI L.', 'PLANAMENTE J.',
  'POLIONI V.', 'PRIMI D.', 'PROIETTI A.', 'PROTA P.', 'QUINZI M.',
  'RAMACOGI M.G.', 'RE V.', 'RINALDI B.', 'RONDONI P.', 'ROSSET I.',
  'SALE F.', 'SANSONI S.', 'SAVI F.', 'SCHIAVETTI D.', 'SIMONETTI D.',
  'SIMONETTI P.', 'SPADONI A.', 'STEFANI A.', 'TANZI V.', 'TOCCI S.',
  'TURRIZIANI COLONNA G.', 'URBANETTI G.', 'VENTURI B.', 'VICINELLI T.',
  'ZECCHINELLI N.',
]
