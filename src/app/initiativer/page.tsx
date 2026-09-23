"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions } from "@/lib/processHelpers";
import { kompleksitetLabels, statusLabels, statusOptions, tidsperspektivLabels } from "@/lib/labels";
import { RagBadge } from "@/components/Badges";
import InitiativeModal from "@/components/InitiativeModal";
import { buttonGhost, buttonPrimary, selectClass } from "@/lib/ui";
import type { Initiativ, ProsessEier } from "@/lib/types";

export default function InitiativoversiktPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [eiere, setEiere] = useState<ProsessEier[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [prosessFilter, setProsessFilter] = useState<string>("alle");
  const [aktiv, setAktiv] = useState<{ mode: "ny" | "rediger"; initiativ?: Initiativ } | null>(
    null
  );

  useEffect(() => {
    async function hentEiere() {
      const res = await fetch("/api/eiere", { cache: "no-store" });
      const data = await res.json();
      setEiere(data);
    }
    hentEiere();
  }, []);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  function prosesseierNavn(prosesseierId: string) {
    return eiere.find((e) => e.id === prosesseierId)?.navn ?? "Ikke satt";
  }

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Initiativoversikt</h1>
          <p className="text-sm text-slate-500">
            Digitaliseringsinitiativer med status, effekt og ansvar.
          </p>
        </div>
        <button onClick={() => setAktiv({ mode: "ny" })} className={buttonPrimary}>
          + Nytt initiativ
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          className={selectClass}
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
          className={selectClass}
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
            className={buttonGhost}
          >
            Nullstill filter
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-indigo-50/60 text-left text-xs font-semibold uppercase tracking-wide text-indigo-900">
            <tr>
              <th className="px-4 py-2">Navn</th>
              <th className="px-4 py-2">Effektbeskrivelse</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Tidsperspektiv</th>
              <th className="px-4 py-2">Kompleksitet</th>
              <th className="px-4 py-2">RAG</th>
              <th className="px-4 py-2">Prosesseier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtrert.map((i) => (
              <tr
                key={i.id}
                onClick={() => setAktiv({ mode: "rediger", initiativ: i })}
                className="cursor-pointer hover:bg-indigo-50/40"
              >
                <td className="px-4 py-2 font-medium text-slate-900">{i.navn}</td>
                <td className="max-w-xs truncate px-4 py-2 text-slate-600" title={i.effektForventet}>
                  {i.effektForventet || "Ikke oppgitt"}
                </td>
                <td className="px-4 py-2 text-slate-600">{statusLabels[i.status]}</td>
                <td className="px-4 py-2 text-slate-600">{tidsperspektivLabels[i.tidsperspektiv]}</td>
                <td className="px-4 py-2 text-slate-600">{kompleksitetLabels[i.kompleksitet]}</td>
                <td className="px-4 py-2">
                  <RagBadge status={i.ragStatus} />
                </td>
                <td className="px-4 py-2 text-slate-600">{prosesseierNavn(i.prosesseierId)}</td>
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
