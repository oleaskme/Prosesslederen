import type { Initiativ } from "./types";

export interface OverlappGruppe {
  berortProcessId: string;
  initiativer: Initiativ[];
}

export interface PorteføljeAnalyse {
  svakEffektmaaling: Initiativ[];
  muligOverlapp: OverlappGruppe[];
  risikovarsler: Initiativ[];
  anbefaltPrioritet: Initiativ[];
}

const SVAK_EFFEKT_LENGDE = 20;
const RISIKO_VARSEL_TERSKEL = 8;

const BASELINE_NOKKELORD = [
  "før og etter",
  "fra dagens",
  "dagens nivå",
  "sammenlignet med i dag",
  "baseline",
  "nullpunkt",
  "målt før",
  "nåsituasjon",
];

function harBaselinereferanse(tekst: string): boolean {
  const lav = tekst.toLowerCase();
  return BASELINE_NOKKELORD.some((n) => lav.includes(n));
}

export function analyserPortefolje(initiatives: Initiativ[]): PorteføljeAnalyse {
  const svakEffektmaaling = initiatives.filter(
    (i) => i.effektMaaling.trim().length < SVAK_EFFEKT_LENGDE || !harBaselinereferanse(i.effektMaaling)
  );

  const grupperPerProsess = new Map<string, Initiativ[]>();
  for (const i of initiatives) {
    const gruppe = grupperPerProsess.get(i.berortProcessId) ?? [];
    gruppe.push(i);
    grupperPerProsess.set(i.berortProcessId, gruppe);
  }
  const muligOverlapp = Array.from(grupperPerProsess.entries())
    .filter(([, gruppe]) => gruppe.length > 1)
    .map(([berortProcessId, gruppe]) => ({ berortProcessId, initiativer: gruppe }));

  const risikovarsler = initiatives.filter(
    (i) => i.ragStatus === "red" || i.risikoSannsynlighet + i.risikoKonsekvens >= RISIKO_VARSEL_TERSKEL
  );

  const anbefaltPrioritet = initiatives
    .filter((i) => i.status !== "avsluttet")
    .map((i) => ({ i, score: i.risikoSannsynlighet + i.risikoKonsekvens + (i.kompleksitet === "høy" ? 2 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.i);

  return { svakEffektmaaling, muligOverlapp, risikovarsler, anbefaltPrioritet };
}

export function joinNorsk(navn: string[]): string {
  if (navn.length === 0) return "";
  if (navn.length === 1) return navn[0];
  if (navn.length === 2) return `${navn[0]} og ${navn[1]}`;
  return `${navn.slice(0, -1).join(", ")} og ${navn[navn.length - 1]}`;
}

export function risikoTiltak(analyse: PorteføljeAnalyse): string {
  if (analyse.risikovarsler.length === 0) {
    return "Ingen initiativer krever risikooppfølging nå. Fortsett å følge med på RAG-status og risikoscore fremover.";
  }
  const navn = analyse.risikovarsler.map((i) => i.navn);
  return `Sett opp en tiltaksplan for å redusere risikoen på ${joinNorsk(navn)}.`;
}

export function effektTiltak(analyse: PorteføljeAnalyse): string {
  const antall = analyse.svakEffektmaaling.length;
  if (antall === 0) {
    return "Effektmålingen i porteføljen viser tydelig hvordan forbedringen fra dagens nivå (baseline) til ny målsetting skal fastslås. Fortsett å kreve dette på nye initiativer.";
  }
  const navn = analyse.svakEffektmaaling.map((i) => i.navn);
  if (antall <= 2) {
    return `${joinNorsk(navn)} bør beskrive effektmålingen som en endring fra dagens nivå (baseline) til en konkret ny KPI, ikke bare hvilket tall som skal følges.`;
  }
  return `${antall} initiativer beskriver hva som skal måles, men ikke hvordan forbedringen fra dagens nivå til ny KPI fastslås. Vurder å kreve en felles mal med baseline og mål for alle initiativer.`;
}

export function overlappTiltak(analyse: PorteføljeAnalyse): string {
  if (analyse.muligOverlapp.length === 0) {
    return "Ingen initiativer overlapper på samme (del)prosess i dag. Sjekk dette på nytt når nye initiativer legges til.";
  }
  if (analyse.muligOverlapp.length === 1) {
    const navn = analyse.muligOverlapp[0].initiativer.map((i) => i.navn);
    return `Vurder om ${joinNorsk(navn)} bør samkjøres eller slås sammen, siden de berører samme (del)prosess.`;
  }
  return "Vurder om initiativene i hver gruppe under bør samkjøres eller slås sammen, siden de berører samme (del)prosess.";
}

export function prioritetTiltak(analyse: PorteføljeAnalyse): string {
  if (analyse.anbefaltPrioritet.length === 0) {
    return "Ingen initiativer peker seg ut for prioritering nå.";
  }
  return "Prioriter disse initiativene først, basert på høyest risiko og kompleksitet:";
}
