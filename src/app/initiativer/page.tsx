"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions, getProcessLabel } from "@/lib/processHelpers";
import {
  kompleksitetLabels,
  statusLabels,
  statusOptions,
  tidsperspektivLabels,
} from "@/lib/labels";
import { RagBadge } from "@/components/Badges";
import InitiativeModal from "@/components/InitiativeModal";
import type { Initiativ } from "@/lib/types";

export default function InitiativoversiktPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [prosessFilter, setProsessFilter] = useState<string>("alle");
  const [aktiv, setAktiv] = useState<{ mode: "ny" | "rediger"; initiativ?: Initiativ } | null>(
    null
  );

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const filtrert = useMemo(() => {
    if (!initiatives) return [];
    return initiatives.filter((i) => {
      if (statusFilter !== "alle" && i.status !== statusFilter) return false;
      if (prosessFilter !== "alle" && i.berortProcessId !== prosessFilter) return false;
      return true;
    });
  }, [initiatives, statusFilter, prosessFilter]);

  function lukkModal() {
    setAktiv(null);
  }

  async function etterEndring() {
    await refetch();
    lukkModal();
  }

  if (loading || !hierarchy) {
    return <p className="text-sm text-slate-500">Laster initiativer...</p>;
  }

  const inputClass =
    "rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Initiativoversikt</h1>
          <p className="text-sm text-slate-500">
            Digitaliseringsinitiativer med status, effekt og ansvar.
          </p>
        </div>
        <button
          onClick={() => setAktiv({ mode: "ny" })}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nytt initiativ
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className={inputClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="alle">Alle statuser</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={prosessFilter}
          onChange={(e) => setProsessFilter(e.target.value)}
        >
          <option value="alle">Alle prosesser</option>
          {processOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {(statusFilter !== "alle" || prosessFilter !== "alle") && (
          <button
            onClick={() => {
              setStatusFilter("alle");
              setProsessFilter("alle");
            }}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Nullstill filter
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Navn</th>
              <th className="px-4 py-2">Berørt prosess</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Tidsperspektiv</th>
              <th className="px-4 py-2">Kompleksitet</th>
              <th className="px-4 py-2">RAG</th>
              <th className="px-4 py-2">Gevinsteier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtrert.map((i) => (
              <tr
                key={i.id}
                onClick={() => setAktiv({ mode: "rediger", initiativ: i })}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-2 font-medium text-slate-900">{i.navn}</td>
                <td className="px-4 py-2 text-slate-600">{getProcessLabel(hierarchy, i.berortProcessId)}</td>
                <td className="px-4 py-2 text-slate-600">{statusLabels[i.status]}</td>
                <td className="px-4 py-2 text-slate-600">{tidsperspektivLabels[i.tidsperspektiv]}</td>
                <td className="px-4 py-2 text-slate-600">{kompleksitetLabels[i.kompleksitet]}</td>
                <td className="px-4 py-2">
                  <RagBadge status={i.ragStatus} />
                </td>
                <td className="px-4 py-2 text-slate-600">{i.gevinsteier}</td>
              </tr>
            ))}
            {filtrert.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Ingen initiativer matcher filteret.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {aktiv && (
        <InitiativeModal
          mode={aktiv.mode}
          initiativ={aktiv.initiativ}
          processOptions={processOptions}
          onClose={lukkModal}
          onSaved={etterEndring}
          onDeleted={etterEndring}
        />
      )}
    </div>
  );
}
