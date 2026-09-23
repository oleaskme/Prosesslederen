"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions } from "@/lib/processHelpers";
import { ragColor, statusLabels, statusOptions } from "@/lib/labels";
import InitiativePanel from "@/components/InitiativePanel";
import { buttonPrimary, selectClass } from "@/lib/ui";
import type { ProsessEier } from "@/lib/types";

export default function InitiativerPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [eiere, setEiere] = useState<ProsessEier[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [eierFilter, setEierFilter] = useState<string>("alle");
  const [valgtId, setValgtId] = useState<string | "ny" | null>(null);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    async function hentEiere() {
      const res = await fetch("/api/eiere", { cache: "no-store" });
      const data = await res.json();
      setEiere(data);
    }
    hentEiere();
  }, []);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const filtrert = useMemo(() => {
    if (!initiatives) return [];
    return initiatives.filter((i) => {
      if (statusFilter !== "alle" && i.status !== statusFilter) return false;
      if (eierFilter !== "alle" && i.prosesseierId !== eierFilter) return false;
      return true;
    });
  }, [initiatives, statusFilter, eierFilter]);

  const effektivId = valgtId ?? filtrert[0]?.id ?? null;
  const valgtInitiativ =
    effektivId && effektivId !== "ny" ? initiatives?.find((i) => i.id === effektivId) : undefined;

  function velg(id: string) {
    setValgtId(id);
    setResetToken((t) => t + 1);
  }

  function nyttInitiativ() {
    setValgtId("ny");
    setResetToken((t) => t + 1);
  }

  async function etterLagring(nyId?: string) {
    await refetch();
    if (nyId) {
      setValgtId(nyId);
    }
    setResetToken((t) => t + 1);
  }

  async function etterSletting() {
    await refetch();
    setValgtId(null);
    setResetToken((t) => t + 1);
  }

  function avbryt() {
    setResetToken((t) => t + 1);
  }

  if (loading || !hierarchy || !initiatives) {
    return <p className="text-sm text-slate-500">Laster initiativer...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Initiativer</h1>
        <p className="text-sm text-slate-500">Velg et initiativ i listen for å se og redigere detaljene.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-col gap-3 lg:w-1/5 lg:shrink-0">
          <button onClick={nyttInitiativ} className={buttonPrimary}>
            + Nytt initiativ
          </button>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Status</span>
              <select
                className={`${selectClass} w-full`}
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
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Eier</span>
              <select
                className={`${selectClass} w-full`}
                value={eierFilter}
                onChange={(e) => setEierFilter(e.target.value)}
              >
                <option value="alle">Alle eiere</option>
                {eiere.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.navn}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex-1 space-y-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {filtrert.map((i) => {
              const aktiv = i.id === effektivId;
              return (
                <button
                  key={i.id}
                  onClick={() => velg(i.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    aktiv ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-indigo-50"
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${ragColor[i.ragStatus]}`} />
                  <span className="truncate">{i.navn}</span>
                </button>
              );
            })}
            {filtrert.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-slate-400">Ingen initiativer matcher filteret.</p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {valgtId === "ny" && (
            <InitiativePanel
              key={`ny-${resetToken}`}
              mode="ny"
              processOptions={processOptions}
              onCancel={avbryt}
              onSaved={etterLagring}
              onDeleted={etterSletting}
            />
          )}
          {valgtId !== "ny" && effektivId && valgtInitiativ && (
            <InitiativePanel
              key={`${effektivId}-${resetToken}`}
              mode="rediger"
              initiativ={valgtInitiativ}
              processOptions={processOptions}
              onCancel={avbryt}
              onSaved={etterLagring}
              onDeleted={etterSletting}
            />
          )}
          {valgtId !== "ny" && !effektivId && (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-sm text-slate-400">
              Velg et initiativ fra listen til venstre, eller opprett et nytt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
