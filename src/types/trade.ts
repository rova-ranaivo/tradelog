import { SESSIONS, ETATS, STRUCTURES, RESULTATS, INSTRUMENTS } from '../config/constants';

export type Session = typeof SESSIONS[number];
export type Etat = typeof ETATS[number];
export type Structure = typeof STRUCTURES[number];
export type Resultat = typeof RESULTATS[number];
export type Instrument = typeof INSTRUMENTS[number];

export interface Trade {
  id: string;
  compte: string;
  date: string;
  heure: string;
  session: Session;
  instrument: Instrument;
  direction: 'Buy' | 'Sell';
  stars: number;
  structure: Structure;
  structureFragile: boolean;
  horsZone: boolean;
  montantRisque: number;
  gainPerte: number;
  resultat: Resultat;
  rr: number | null;
  etat: Etat;
  pourquoi: string;
  doute: string;
  tags: string[];
  screenshotAvant?: string;
  screenshotApres?: string;
}

export interface Account {
  id: string;
  name: string;
  startCapital: number;
  color: string;
}

export interface Cashflow {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  date: string;
  compte: string;
  montantUSD: number;
  montantMUR: number;
  taux: number;
  note: string;
}
