import type {
  Fremdriftsstatus,
  InitiativStatus,
  Kompleksitet,
  ProcessRelevans,
  RagStatus,
  RisikoSkala,
  Tidsperspektiv,
} from "./types";

export const statusLabels: Record<InitiativStatus, string> = {
  "idé": "Idé",
  vurdert: "Vurdert",
  prioritert: "Prioritert",
  "pågår": "Pågår",
  "i drift": "I drift",
  "lagt ned": "Lagt ned",
};

export const statusOptions: InitiativStatus[] = [
  "idé",
  "vurdert",
  "prioritert",
  "pågår",
  "i drift",
  "lagt ned",
];

export const fremdriftLabels: Record<Fremdriftsstatus, string> = {
  "ikke påbegynt": "Ikke påbegynt",
  "pågående": "Pågående",
  avsluttet: "Avsluttet",
};

export const fremdriftOptions: Fremdriftsstatus[] = [
  "ikke påbegynt",
  "pågående",
  "avsluttet",
];

export const ragLabels: Record<RagStatus, string> = {
  red: "Red",
  amber: "Amber",
  green: "Green",
};

export const ragOptions: RagStatus[] = ["red", "amber", "green"];

export const tidsperspektivLabels: Record<Tidsperspektiv, string> = {
  na: "Gjøres nå",
  neste9mnd: "Neste 9 måneder",
  "1til3aar": "1 til 3 år",
};

export const tidsperspektivOptions: Tidsperspektiv[] = ["na", "neste9mnd", "1til3aar"];

export const kompleksitetLabels: Record<Kompleksitet, string> = {
  lav: "Lav",
  "høy": "Høy",
};

export const kompleksitetOptions: Kompleksitet[] = ["lav", "høy"];

export const risikoSkalaLabels: Record<RisikoSkala, string> = {
  1: "Svært lav",
  2: "Lav",
  3: "Middels",
  4: "Høy",
  5: "Svært høy",
};

export const risikoSkalaOptions: RisikoSkala[] = [1, 2, 3, 4, 5];

export const relevansLabels: Record<ProcessRelevans, string> = {
  kjerne: "Kjerne",
  grensesnitt: "Grensesnitt",
  indirekte: "Indirekte",
  "ikke relevant": "Ikke relevant",
};

export const relevansOptions: ProcessRelevans[] = [
  "kjerne",
  "grensesnitt",
  "indirekte",
  "ikke relevant",
];

export const ragColor: Record<RagStatus, string> = {
  red: "bg-red-500",
  amber: "bg-amber-400",
  green: "bg-emerald-500",
};

export const relevansColor: Record<ProcessRelevans, string> = {
  kjerne: "bg-indigo-100 text-indigo-800 border-indigo-300",
  grensesnitt: "bg-teal-50 text-teal-700 border-teal-200",
  indirekte: "bg-amber-50 text-amber-700 border-amber-200",
  "ikke relevant": "bg-slate-50 text-slate-400 border-slate-200",
};
