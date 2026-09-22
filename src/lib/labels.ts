import type {
  Fremdriftsstatus,
  InitiativStatus,
  Kompleksitet,
  Nivaa,
  ProcessRelevans,
  RagStatus,
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

export const nivaaLabels: Record<Nivaa, string> = {
  lav: "Lav",
  middels: "Middels",
  "høy": "Høy",
};

export const nivaaOptions: Nivaa[] = ["lav", "middels", "høy"];

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
  kjerne: "bg-blue-100 text-blue-800 border-blue-300",
  grensesnitt: "bg-sky-50 text-sky-700 border-sky-200",
  indirekte: "bg-slate-100 text-slate-600 border-slate-200",
  "ikke relevant": "bg-slate-50 text-slate-400 border-slate-200",
};
