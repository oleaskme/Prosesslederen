"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions, getProcessLabel } from "@/lib/processHelpers";
import { faseLabels, fremdriftLabels, fremdriftOptions, ragLabels, ragOptions } from "@/lib/labels";
import { RagBadge, Pill } from "@/components/Badges";
import InitiativeModal from "@/components/InitiativeModal";
import { selectClass } from "@/lib/ui";
import type { Fremdriftsstatus, Initiativ } from "@/lib/types";

const kolonneAksent: Record<Fremdriftsstatus, string> = {
  "ikke påbegynt": "border-t-slate-400",
  "pågående": "border-t-indigo-500",
  avsluttet: "border-t-emerald-500",
};

const kolonneBadge: Record<Fremdriftsstatus, string> = {
  "ikke påbegynt": "bg-slate-100 text-slate-600",
  "pågående": "bg-indigo-100 text-indigo-700",
  avsluttet: "bg-emerald-100 text-emerald-700",
};

export default function FremdriftPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [ragFilter, setRagFilter] = useState<string>("alle");
  const [valgt, setValgt] = useState<Initiativ | null>(null);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const filtrert = useMemo(() => {
    if (!initiatives) return [];
    return initiatives.filter((i) => ragFilter === "alle" || i.ragStatus === ragFilter);
  }, [initiatives, ragFilter]);

  function kolonneItems(fremdriftsstatus: Fremdriftsstatus) {
    return filtrert.filter((i) => i.fremdriftsstatus === fremdriftsstatus);
  }

  async function etterEndring() {
    await refetch();
    setValgt(null);
  }

  if (loading || !hierarchy) {
    return <p className="text-sm text-slate-500">Laster fremdrift...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Fremdrift</h1>
        <p className="text-sm text-slate-500">
          Alle initiativer fordelt etter fremdriftsstatus. Klikk på et initiativ for å åpne detaljene.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className={selectClass} value={ragFilter} onChange={(e) => setRagFilter(e.target.value)}>
          <option value="alle">Alle RAG-statuser</option>
          {ragOptions.map((r) => (
            <option key={r} value={r}>
              {ragLabels[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {fremdriftOptions.map((f) => {
          const items = kolonneItems(f);
          return (
            <div
              key={f}
              className={`rounded-xl border border-slate-200 border-t-4 bg-slate-50/60 p-3 ${kolonneAksent[f]}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-700">{fremdriftLabels[f]}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${kolonneBadge[f]}`}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setValgt(i)}
                    className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-indigo-300 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-slate-900">{i.navn}</h3>
                      <RagBadge status={i.ragStatus} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{getProcessLabel(hierarchy, i.berortProcessId)}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <Pill>{faseLabels[i.fase]}</Pill>
                    </div>
                  </button>
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-3 text-center text-xs text-slate-400">Ingen initiativer her.</p>
                )}
              </div>
            </div>
          );
        })}
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
