"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import ProcessTree from "@/components/ProcessTree";
import ProsesseierePanel from "@/components/admin/ProsesseierePanel";
import StatusPanel from "@/components/admin/StatusPanel";

type Seksjon = "hierarki" | "eiere" | "status";

const seksjoner: { id: Seksjon; label: string; beskrivelse: string }[] = [
  { id: "hierarki", label: "Prosesshierarki", beskrivelse: "APQC-hierarki, nivå 1 til 3" },
  { id: "eiere", label: "Prosesseiere", beskrivelse: "Standard eiere per delprosess" },
  { id: "status", label: "Status", beskrivelse: "Fordeling av initiativer" },
];

export default function AdminPage() {
  const { initiatives, hierarchy, loading, refetch } = useAppData();
  const [valgt, setValgt] = useState<Seksjon>("hierarki");

  if (loading || !hierarchy || !initiatives) {
    return <p className="text-sm text-slate-500">Laster admin...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin</h1>
        <p className="text-sm text-slate-500">
          Prosesshierarki etter APQC Process Classification Framework, prosesseiere og status.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:w-1/5 lg:shrink-0 lg:flex-col lg:gap-1.5 lg:overflow-visible">
          {seksjoner.map((s) => {
            const aktiv = s.id === valgt;
            return (
              <button
                key={s.id}
                onClick={() => setValgt(s.id)}
                className={`shrink-0 rounded-lg px-3.5 py-2.5 text-left transition-colors ${
                  aktiv
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                } border border-slate-200`}
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className={`text-xs ${aktiv ? "text-indigo-100" : "text-slate-400"}`}>{s.beskrivelse}</div>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {valgt === "hierarki" && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Prosesshierarki</h2>
              <ProcessTree hierarchy={hierarchy} onChanged={refetch} />
            </div>
          )}
          {valgt === "eiere" && <ProsesseierePanel hierarchy={hierarchy} onChanged={refetch} />}
          {valgt === "status" && <StatusPanel initiatives={initiatives} />}
        </div>
      </div>
    </div>
  );
}
