"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { getProcessOptions, getProcessLabel } from "@/lib/processHelpers";
import { faseLabels, ragLabels, ragOptions, statusLabels, statusOptions } from "@/lib/labels";
import { RagBadge, Pill } from "@/components/Badges";
import InitiativeModal from "@/components/InitiativeModal";
import { selectClass } from "@/lib/ui";
import type { Initiativ, Status } from "@/lib/types";

const kolonneAksent: Record<Status, string> = {
  "ikke påbegynt": "border-t-slate-400",
  "pågående": "border-t-indigo-500",
  avsluttet: "border-t-emerald-500",
};

const kolonneBadge: Record<Status, string> = {
  "ikke påbegynt": "bg-slate-100 text-slate-600",
  "pågående": "bg-indigo-100 text-indigo-700",
  avsluttet: "bg-emerald-100 text-emerald-700",
};

export default function FremdriftPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [ragFilter, setRagFilter] = useState<string>("alle");
  const [valgt, setValgt] = useState<Initiativ | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverKolonne, setDragOverKolonne] = useState<Status | null>(null);

  const processOptions = useMemo(() => (hierarchy ? getProcessOptions(hierarchy) : []), [hierarchy]);

  const filtrert = useMemo(() => {
    if (!initiatives) return [];
    return initiatives.filter((i) => ragFilter === "alle" || i.ragStatus === ragFilter);
  }, [initiatives, ragFilter]);

  function kolonneItems(status: Status) {
    return filtrert.filter((i) => i.status === status);
  }

  async function etterEndring() {
    await refetch();
    setValgt(null);
  }

  async function flyttTilStatus(id: string, status: Status) {
    const initiativ = initiatives?.find((i) => i.id === id);
    if (!initiativ || initiativ.status === status) return;
    await fetch(`/api/initiatives/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refetch();
  }

  if (loading || !hierarchy) {
    return <p className="text-sm text-slate-500">Laster fremdrift...</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Fremdrift</h1>
        <p className="text-sm text-slate-500">
          Alle initiativer fordelt etter status. Dra et kort til en annen kolonne for å endre status, eller klikk for
          å åpne detaljene.
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
        {statusOptions.map((f) => {
          const items = kolonneItems(f);
          return (
            <div
              key={f}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKolonne(f);
              }}
              onDragLeave={() => setDragOverKolonne((k) => (k === f ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                setDragOverKolonne(null);
                setDragId(null);
                if (id) flyttTilStatus(id, f);
              }}
              className={`rounded-xl border border-slate-200 border-t-4 bg-slate-50/60 p-3 transition-colors ${kolonneAksent[f]} ${
                dragOverKolonne === f ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300" : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-700">{statusLabels[f]}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${kolonneBadge[f]}`}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {items.map((i) => (
                  <button
                    key={i.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", i.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragId(i.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOverKolonne(null);
                    }}
                    onClick={() => setValgt(i)}
                    className={`block w-full cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:border-indigo-300 hover:shadow-md active:cursor-grabbing ${
                      dragId === i.id ? "opacity-40" : ""
                    }`}
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
