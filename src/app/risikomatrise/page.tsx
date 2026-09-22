"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions } from "@/lib/processHelpers";
import { nivaaLabels } from "@/lib/labels";
import InitiativeModal from "@/components/InitiativeModal";
import type { Initiativ, Nivaa } from "@/lib/types";

const nivaaIndex: Record<Nivaa, number> = { lav: 1, middels: 2, "høy": 3 };

const cellFarge: Record<number, string> = {
  2: "bg-emerald-50",
  3: "bg-lime-50",
  4: "bg-amber-50",
  5: "bg-orange-100",
  6: "bg-red-100",
};

const dotFarge: Record<number, string> = {
  2: "bg-emerald-500",
  3: "bg-lime-500",
  4: "bg-amber-500",
  5: "bg-orange-500",
  6: "bg-red-500",
};

const bokstaver = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const konsekvensRader: Nivaa[] = ["høy", "middels", "lav"];
const sannsynlighetKolonner: Nivaa[] = ["lav", "middels", "høy"];

export default function RisikomatrisePage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [valgt, setValgt] = useState<Initiativ | null>(null);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const merkede = useMemo(
    () => (initiatives ?? []).map((i, idx) => ({ ...i, bokstav: bokstaver[idx % bokstaver.length] })),
    [initiatives]
  );

  function cellItems(sannsynlighet: Nivaa, konsekvens: Nivaa) {
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
          Risiko for tillit per initiativ, plassert etter sannsynlighet og konsekvens. Klikk på et initiativ for å
          åpne detaljene.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex overflow-x-auto lg:flex-1">
          <div className="flex w-6 shrink-0 items-center justify-center pb-8">
            <span
              className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-400"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Konsekvens ↑
            </span>
          </div>
          <div className="min-w-[560px] flex-1">
          <div className="grid grid-cols-[120px_repeat(3,1fr)] gap-2">
            <div />
            {sannsynlighetKolonner.map((s) => (
              <div key={s} className="px-2 text-center text-sm font-semibold text-slate-700">
                {nivaaLabels[s]}
              </div>
            ))}

            {konsekvensRader.map((konsekvens) => (
              <div key={konsekvens} className="contents">
                <div className="flex items-center px-2 text-sm font-semibold text-slate-700">
                  {nivaaLabels[konsekvens]}
                </div>
                {sannsynlighetKolonner.map((sannsynlighet) => {
                  const score = nivaaIndex[sannsynlighet] + nivaaIndex[konsekvens];
                  const items = cellItems(sannsynlighet, konsekvens);
                  return (
                    <div
                      key={`${sannsynlighet}-${konsekvens}`}
                      className={`min-h-[110px] rounded-lg border border-slate-200 p-2 ${cellFarge[score]}`}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((i) => (
                          <button
                            key={i.id}
                            onClick={() => setValgt(i)}
                            title={i.navn}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm hover:opacity-80 ${dotFarge[score]}`}
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
          <p className="mt-2 pl-[120px] text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sannsynlighet →
          </p>
          </div>
        </div>

        <div className="lg:w-72 lg:shrink-0">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Initiativer</h2>
          <ul className="space-y-2">
            {merkede.map((i) => {
              const score = nivaaIndex[i.risikoSannsynlighet] + nivaaIndex[i.risikoKonsekvens];
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
