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

export function analyserPortefolje(initiatives: Initiativ[]): PorteføljeAnalyse {
  const svakEffektmaaling = initiatives.filter(
    (i) => i.effektMaaling.trim().length < SVAK_EFFEKT_LENGDE
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
