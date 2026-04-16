import type { Angebote, Projekte, Rechnungen, Rechnungsliste } from './app';

export type EnrichedAngebote = Angebote & {
  projektName: string;
  leistungenName: string;
};

export type EnrichedRechnungen = Rechnungen & {
  projektName: string;
  leistungenName: string;
};

export type EnrichedRechnungsliste = Rechnungsliste & {
  rechnungName: string;
  zugehoeriges_angebotName: string;
  projektName: string;
  kundeName: string;
};

export type EnrichedProjekte = Projekte & {
  kundeName: string;
  projektleiterName: string;
};
