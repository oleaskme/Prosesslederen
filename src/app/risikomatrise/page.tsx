"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions } from "@/lib/processHelpers";
import { risikoSkalaLabels } from "@/lib/labels";
import InitiativeModal from "@/components/InitiativeModal";
import type { Initiativ, RisikoSkala } from "@/lib/types";

const cellFarge: Record<number, string> = {
  2: "bg-emerald-50",
  3: "bg-emerald-100",
  4: "bg-lime-100",
  5: "bg-yellow-100",
  6: "bg-amber-100",
  7: "bg-orange-100",
  8: "bg-orange-200",
  9: "bg-red-100",
  10: "bg-red-200",
};

const dotFarge: Record<number, string> = {
  2: "bg-emerald-500",
  3: "bg-emerald-500",
  4: "bg-lime-500",
  5: "bg-yellow-500",
  6: "bg-amber-500",
  7: "bg-orange-500",
  8: "bg-orange-600",
  9: "bg-red-500",
  10: "bg-red-600",
};

const bokstaver = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const konsekvensRader: RisikoSkala[] = [5, 4, 3, 2, 1];
const sannsynlighetKolonner: RisikoSkala[] = [1, 2, 3, 4, 5];

export default function RisikomatrisePage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [valgt, setValgt] = useState<Initiativ | null>(null);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const merkede = useMemo(
    () => (initiatives ?? []).map((i, idx) => ({ ...i, bokstav: bokstaver[idx % bokstaver.length] })),
    [initiatives]
  );

  function cellItems(sannsynlighet: RisikoSkala, konsekvens: RisikoSkala) {
    return merkede.filter((i) => i.risikoSannsynlighet === sannsynlighet && i.risikoKonsekvens === konsekvens);
  }

  async function etterEndring() {
    await refetch();
    setValgt(null);
  }

  if (loading || !hierarchy) {
    return <p className="text-sm text-slate-500">Laster risikomatrise...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Risikomatrise</h1>
        <p className="text-sm text-slate-500">
          Risiko for tillit per initiativ, på en skala fra 1 (svært lav) til 5 (svært høy) for sannsynlighet og
          konsekvens. Klikk på et initiativ for å åpne detaljene.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex overflow-x-auto lg:flex-1">
          <div className="flex w-6 shrink-0 items-center justify-center pb-9">
            <span
              className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-400"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Konsekvens ↑
            </span>
          </div>
          <div className="min-w-[620px] flex-1">
            <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2">
              <div />
              {sannsynlighetKolonner.map((s) => (
                <div key={s} className="flex flex-col items-center px-1 text-center">
                  <span className="text-sm font-semibold text-slate-700">{s}</span>
                  <span className="text-[10px] text-slate-400">{risikoSkalaLabels[s]}</span>
                </div>
              ))}

              {konsekvensRader.map((konsekvens) => (
                <div key={konsekvens} className="contents">
                  <div className="flex flex-col justify-center px-2">
                    <span className="text-sm font-semibold text-slate-700">{konsekvens}</span>
                    <span className="text-[10px] text-slate-400">{risikoSkalaLabels[konsekvens]}</span>
                  </div>
                  {sannsynlighetKolonner.map((sannsynlighet) => {
                    const score = sannsynlighet + konsekvens;
                    const items = cellItems(sannsynlighet, konsekvens);
                    return (
                      <div
                        key={`${sannsynlighet}-${konsekvens}`}
                        className={`min-h-[84px] rounded-lg border border-slate-200 p-1.5 ${cellFarge[score]}`}
                      >
                        <div className="flex flex-wrap gap-1">
                          {items.map((i) => (
                            <button
                              key={i.id}
                              onClick={() => setValgt(i)}
                              title={i.navn}
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm hover:opacity-80 ${dotFarge[score]}`}
                            >
                              {i.bokstav}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="mt-2 pl-[100px] text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sannsynlighet →
            </p>
          </div>
        </div>

        <div className="lg:w-72 lg:shrink-0">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Initiativer</h2>
          <ul className="space-y-2">
            {merkede.map((i) => {
              const score = i.risikoSannsynlighet + i.risikoKonsekvens;
              return (
                <li key={i.id}>
                  <button
                    onClick={() => setValgt(i)}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm hover:border-indigo-300"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${dotFarge[score]}`}
                    >
                      {i.bokstav}
                    </span>
                    <span className="text-slate-700">{i.navn}</span>
                  </button>
                </li>
              );
            })}
            {merkede.length === 0 && <li className="text-sm text-slate-400">Ingen initiativer registrert.</li>}
          </ul>
        </div>
      </div>

      {valgt && (
        <InitiativeModal
          mode="rediger"
          initiativ={valgt}
          processOptions={processOptions}
          onClose={() => setValgt(null)}
          onSaved={etterEndring}
          onDeleted={etterEndring}
        />
      )}
    </div>
  );
}
