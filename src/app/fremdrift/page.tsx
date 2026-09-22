"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions, getProcessLabel } from "@/lib/processHelpers";
import { fremdriftLabels, fremdriftOptions, ragLabels, ragOptions, statusLabels } from "@/lib/labels";
import { RagBadge, Pill } from "@/components/Badges";
import InitiativeModal from "@/components/InitiativeModal";
import { selectClass } from "@/lib/ui";
import type { Initiativ } from "@/lib/types";

export default function FremdriftPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [fremdriftFilter, setFremdriftFilter] = useState<string>("alle");
  const [ragFilter, setRagFilter] = useState<string>("alle");
  const [valgt, setValgt] = useState<Initiativ | null>(null);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const filtrert = useMemo(() => {
    if (!initiatives) return [];
    return initiatives
      .filter((i) => i.status === "pågår" || i.status === "i drift")
      .filter((i) => fremdriftFilter === "alle" || i.fremdriftsstatus === fremdriftFilter)
      .filter((i) => ragFilter === "alle" || i.ragStatus === ragFilter);
  }, [initiatives, fremdriftFilter, ragFilter]);

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
          Initiativer som pågår eller er i drift, med fremdriftsstatus og RAG. Klikk for detaljer.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className={selectClass} value={fremdriftFilter} onChange={(e) => setFremdriftFilter(e.target.value)}>
          <option value="alle">Alle fremdriftsstatuser</option>
          {fremdriftOptions.map((f) => (
            <option key={f} value={f}>
              {fremdriftLabels[f]}
            </option>
          ))}
        </select>
        <select className={selectClass} value={ragFilter} onChange={(e) => setRagFilter(e.target.value)}>
          <option value="alle">Alle RAG-statuser</option>
          {ragOptions.map((r) => (
            <option key={r} value={r}>
              {ragLabels[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrert.map((i) => (
          <button
            key={i.id}
            onClick={() => setValgt(i)}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-slate-900">{i.navn}</h3>
              <RagBadge status={i.ragStatus} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{getProcessLabel(hierarchy, i.berortProcessId)}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Pill>{statusLabels[i.status]}</Pill>
              <Pill tone="muted">{fremdriftLabels[i.fremdriftsstatus]}</Pill>
            </div>
          </button>
        ))}
        {filtrert.length === 0 && (
          <p className="text-sm text-slate-400 sm:col-span-2 lg:col-span-3">
            Ingen initiativer matcher filteret.
          </p>
        )}
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
