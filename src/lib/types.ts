export type Delprosess = "PLAN" | "GJENNOMFØRING" | "STYRING";

export type ProcessRelevans = "kjerne" | "grensesnitt" | "indirekte" | "ikke relevant";

export type InitiativFase =
  | "idéfase"
  | "konseptfase"
  | "forprosjektfase"
  | "gjennomføringsfase"
  | "avslutningsfase";

export type Fremdriftsstatus = "ikke påbegynt" | "pågående" | "avsluttet";

export type RagStatus = "red" | "amber" | "green";

export type Tidsperspektiv = "na" | "neste9mnd" | "1til3aar";

export type Kompleksitet = "lav" | "høy";

export type RisikoSkala = 1 | 2 | 3 | 4 | 5;

export interface ProcessLevel1 {
  id: string;
  kode: string;
  navn: string;
  relevans: ProcessRelevans;
}

export interface ProcessLevel2 {
  id: string;
  level1Id: string;
  navn: string;
}

export interface ProcessLevel3 {
  id: string;
  level2Id: string;
  navn: string;
  delprosess: Delprosess;
  eierOverstyring: string | null;
}

export interface ProsessEier {
  id: string;
  navn: string;
  avdeling: string;
  seksjon: Delprosess;
  tittel: string;
}

export interface ProcessHierarchy {
  level1: ProcessLevel1[];
  level2: ProcessLevel2[];
  level3: ProcessLevel3[];
}

export interface Initiativ {
  id: string;
  navn: string;
  beskrivelse: string;
  berortProcessId: string;
  effektForventet: string;
  effektMaaling: string;
  prosesseierId: string;
  subjectMatterExpertId: string;
  fase: InitiativFase;
  fremdriftsstatus: Fremdriftsstatus;
  ragStatus: RagStatus;
  tidsperspektiv: Tidsperspektiv;
  kompleksitet: Kompleksitet;
  avhengighetTeknologi: string;
  avhengighetProsess: string;
  avhengighetKompetanse: string;
  risikoSannsynlighet: RisikoSkala;
  risikoKonsekvens: RisikoSkala;
  opprettet: string;
  oppdatert: string;
}

export interface Database {
  processHierarchy: ProcessHierarchy;
  initiatives: Initiativ[];
  eiere: ProsessEier[];
}
