"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions } from "@/lib/processHelpers";
import { kompleksitetLabels, kompleksitetOptions, tidsperspektivLabels, tidsperspektivOptions } from "@/lib/labels";
import { RagBadge } from "@/components/Badges";
import InitiativeModal from "@/components/InitiativeModal";
import type { Initiativ, Kompleksitet, ProsessEier, Tidsperspektiv } from "@/lib/types";

export default function PrioriteringsmatrisePage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [eiere, setEiere] = useState<ProsessEier[]>([]);
  const [valgt, setValgt] = useState<Initiativ | null>(null);

  useEffect(() => {
    async function hentEiere() {
      const res = await fetch("/api/eiere", { cache: "no-store" });
      const data = await res.json();
      setEiere(data);
    }
    hentEiere();
  }, []);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  function gevinsteierNavn(prosesseierId: string) {
    return eiere.find((e) => e.id === prosesseierId)?.navn ?? "Ikke satt";
  }

  function cellItems(tid: Tidsperspektiv, kompl: Kompleksitet) {
    return (initiatives ?? []).filter(
      (i) => i.tidsperspektiv === tid && i.kompleksitet === kompl && i.fremdriftsstatus !== "avsluttet"
    );
  }

  async function etterEndring() {
    await refetch();
    setValgt(null);
  }

  if (loading || !hierarchy) {
    return <p className="text-sm text-slate-500">Laster matrise...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Prioriteringsmatrise</h1>
        <p className="text-sm text-slate-500">
          Initiativer plassert etter tidsperspektiv og kompleksitet. Klikk på et initiativ for å åpne detaljene.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[140px_repeat(3,1fr)] gap-3">
          <div />
          {tidsperspektivOptions.map((tid) => (
            <div key={tid} className="px-2 text-center text-sm font-semibold text-slate-700">
              {tidsperspektivLabels[tid]}
            </div>
          ))}

          {kompleksitetOptions.map((kompl) => (
            <div key={kompl} className="contents">
              <div className="flex items-center px-2 text-sm font-semibold text-slate-700">
                {kompleksitetLabels[kompl]}
              </div>
              {tidsperspektivOptions.map((tid) => {
                const items = cellItems(tid, kompl);
                return (
                  <div
                    key={`${tid}-${kompl}`}
                    className="min-h-[140px] rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                  >
                    <div className="space-y-2">
                      {items.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => setValgt(i)}
                          className={`block w-full rounded-md bg-indigo-50/40 px-2 py-1.5 text-left text-xs hover:bg-white ${
                            i.fremdriftsstatus === "pågående"
                              ? "border-4 border-emerald-500 hover:border-emerald-600"
                              : "border border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-slate-800">{i.navn}</span>
                            <RagBadge status={i.ragStatus} />
                          </div>
                          <div className="mt-0.5 text-slate-500">{gevinsteierNavn(i.prosesseierId)}</div>
                        </button>
                      ))}
                      {items.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-300">Ingen initiativer</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
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
