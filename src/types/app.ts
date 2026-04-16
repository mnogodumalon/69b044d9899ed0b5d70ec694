// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Leistungskatalog {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategorie?: LookupValue;
    beschreibung?: string;
    standardpreis?: number;
    einheit?: LookupValue;
    notizen?: string;
    leistungsbezeichnung?: string;
  };
}

export interface Angebote {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    angebotsnummer?: string;
    angebotsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    projekt?: string; // applookup -> URL zu 'Projekte' Record
    leistungen?: string; // applookup -> URL zu 'Leistungskatalog' Record
    gesamtpreis?: number;
    gueltigkeitsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    angebotsstatus?: LookupValue;
    bemerkungen?: string;
  };
}

export interface Rechnungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    rechnungsnummer?: string;
    rechnungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    projekt?: string; // applookup -> URL zu 'Projekte' Record
    leistungen?: string; // applookup -> URL zu 'Leistungskatalog' Record
    rechnungsbetrag?: number;
    faelligkeitsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    zahlungsstatus?: LookupValue;
    zahlungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    bemerkungen?: string;
  };
}

export interface Kunden {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    organisation?: string;
    ansprechperson_vorname?: string;
    ansprechperson_nachname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    stadt?: string;
    notizen?: string;
  };
}

export interface Rechnungsliste {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    rechnung?: string; // applookup -> URL zu 'Rechnungen' Record
    zugehoeriges_angebot?: string; // applookup -> URL zu 'Angebote' Record
    projekt?: string; // applookup -> URL zu 'Projekte' Record
    kunde?: string; // applookup -> URL zu 'Kunden' Record
    rechnungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    rechnungsbetrag?: number;
    zahlungsstatus?: LookupValue;
    bemerkungen?: string;
  };
}

export interface Berater {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    kuerzel?: string;
    rolle?: LookupValue;
    status?: LookupValue;
    email?: string;
    telefon?: string;
    kompetenzen?: string;
  };
}

export interface Projekte {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    projektnummer?: string;
    projektname?: string;
    kunde?: string; // applookup -> URL zu 'Kunden' Record
    kategorie?: LookupValue;
    projektleiter?: string; // applookup -> URL zu 'Berater' Record
    partner?: string;
    status?: LookupValue;
    beginn?: string; // Format: YYYY-MM-DD oder ISO String
    projektstand_beschreibung?: string;
    naechster_schritt?: string;
    beschreibung?: string;
    eigene_rolle?: string;
  };
}

export const APP_IDS = {
  LEISTUNGSKATALOG: '69b0449d2b38b929a62bf826',
  ANGEBOTE: '69b0449f1057da227ac2d5f0',
  RECHNUNGEN: '69b044a030862338e09ce6de',
  KUNDEN: '69b04492d5d4fe137f4a9821',
  RECHNUNGSLISTE: '69b044a21918feff3a9b0843',
  BERATER: '69b0449d6737c09ddb24e807',
  PROJEKTE: '69b0449ea6dca0c5c7b66201',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'leistungskatalog': {
    kategorie: [{ key: "sb", label: "Strategieberatung (SB)" }, { key: "co", label: "Coaching (CO)" }, { key: "pe", label: "Personalprojekte (PE)" }, { key: "ig", label: "Interimsgeschäftsführung (IG)" }, { key: "ib", label: "Inklusionsbetriebe (IB)" }, { key: "pi", label: "Projekte Inklusion (PI)" }, { key: "wo", label: "Workshops/Seminare (WO)" }, { key: "ip", label: "Immobilienprojekte (IP)" }, { key: "it", label: "IT-Projekte (IT)" }, { key: "so", label: "Sonstiges (SO)" }],
    einheit: [{ key: "stunde", label: "pro Stunde" }, { key: "tag", label: "pro Tag" }, { key: "pauschal", label: "Pauschal" }, { key: "monat", label: "pro Monat" }],
  },
  'angebote': {
    angebotsstatus: [{ key: "entwurf", label: "Entwurf" }, { key: "versendet", label: "Versendet" }, { key: "angenommen", label: "Angenommen" }, { key: "abgelehnt", label: "Abgelehnt" }],
  },
  'rechnungen': {
    zahlungsstatus: [{ key: "offen", label: "Offen" }, { key: "bezahlt", label: "Bezahlt" }, { key: "ueberfaellig", label: "Überfällig" }, { key: "teilweise_bezahlt", label: "Teilweise bezahlt" }, { key: "storniert", label: "Storniert" }],
  },
  'rechnungsliste': {
    zahlungsstatus: [{ key: "offen", label: "Offen" }, { key: "bezahlt", label: "Bezahlt" }, { key: "ueberfaellig", label: "Überfällig" }, { key: "teilweise_bezahlt", label: "Teilweise bezahlt" }, { key: "storniert", label: "Storniert" }],
  },
  'berater': {
    rolle: [{ key: "geschaeftsfuehrer", label: "Geschäftsführer" }, { key: "berater", label: "Berater" }, { key: "coach", label: "Coach" }, { key: "projektentwickler", label: "Projektentwickler" }, { key: "interimsmanager", label: "Interimsmanager" }, { key: "moderator", label: "Moderator" }, { key: "externer_partner", label: "Externer Partner" }],
    status: [{ key: "aktiv", label: "Aktiv" }, { key: "verfuegbar", label: "Verfügbar" }, { key: "ausgelastet", label: "Ausgelastet" }, { key: "inaktiv", label: "Inaktiv" }],
  },
  'projekte': {
    kategorie: [{ key: "sb", label: "Strategieberatung (SB)" }, { key: "co", label: "Coaching (CO)" }, { key: "pe", label: "Personalprojekte (PE)" }, { key: "ig", label: "Interimsgeschäftsführung (IG)" }, { key: "ib", label: "Inklusionsbetriebe (IB)" }, { key: "pi", label: "Projekte Inklusion (PI)" }, { key: "wo", label: "Workshops/Seminare (WO)" }, { key: "ip", label: "Immobilienprojekte (IP)" }, { key: "it", label: "IT-Projekte (IT)" }, { key: "so", label: "Sonstiges (SO)" }],
    status: [{ key: "aktuell", label: "1 - Aktuell" }, { key: "akquise", label: "2 - Akquise" }, { key: "abgeschlossen", label: "3 - Abgeschlossen" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'leistungskatalog': {
    'kategorie': 'lookup/select',
    'beschreibung': 'string/textarea',
    'standardpreis': 'number',
    'einheit': 'lookup/select',
    'notizen': 'string/textarea',
    'leistungsbezeichnung': 'string/text',
  },
  'angebote': {
    'angebotsnummer': 'string/text',
    'angebotsdatum': 'date/date',
    'projekt': 'applookup/select',
    'leistungen': 'applookup/select',
    'gesamtpreis': 'number',
    'gueltigkeitsdatum': 'date/date',
    'angebotsstatus': 'lookup/select',
    'bemerkungen': 'string/textarea',
  },
  'rechnungen': {
    'rechnungsnummer': 'string/text',
    'rechnungsdatum': 'date/date',
    'projekt': 'applookup/select',
    'leistungen': 'applookup/select',
    'rechnungsbetrag': 'number',
    'faelligkeitsdatum': 'date/date',
    'zahlungsstatus': 'lookup/select',
    'zahlungsdatum': 'date/date',
    'bemerkungen': 'string/textarea',
  },
  'kunden': {
    'organisation': 'string/text',
    'ansprechperson_vorname': 'string/text',
    'ansprechperson_nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'postleitzahl': 'string/text',
    'stadt': 'string/text',
    'notizen': 'string/textarea',
  },
  'rechnungsliste': {
    'rechnung': 'applookup/select',
    'zugehoeriges_angebot': 'applookup/select',
    'projekt': 'applookup/select',
    'kunde': 'applookup/select',
    'rechnungsdatum': 'date/date',
    'rechnungsbetrag': 'number',
    'zahlungsstatus': 'lookup/select',
    'bemerkungen': 'string/textarea',
  },
  'berater': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'kuerzel': 'string/text',
    'rolle': 'lookup/select',
    'status': 'lookup/select',
    'email': 'string/email',
    'telefon': 'string/tel',
    'kompetenzen': 'string/textarea',
  },
  'projekte': {
    'projektnummer': 'string/text',
    'projektname': 'string/text',
    'kunde': 'applookup/select',
    'kategorie': 'lookup/select',
    'projektleiter': 'applookup/select',
    'partner': 'string/text',
    'status': 'lookup/select',
    'beginn': 'date/date',
    'projektstand_beschreibung': 'string/textarea',
    'naechster_schritt': 'string/textarea',
    'beschreibung': 'string/textarea',
    'eigene_rolle': 'string/text',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateLeistungskatalog = StripLookup<Leistungskatalog['fields']>;
export type CreateAngebote = StripLookup<Angebote['fields']>;
export type CreateRechnungen = StripLookup<Rechnungen['fields']>;
export type CreateKunden = StripLookup<Kunden['fields']>;
export type CreateRechnungsliste = StripLookup<Rechnungsliste['fields']>;
export type CreateBerater = StripLookup<Berater['fields']>;
export type CreateProjekte = StripLookup<Projekte['fields']>;