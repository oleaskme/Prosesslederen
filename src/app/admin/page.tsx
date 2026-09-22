"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import ProcessTree from "@/components/ProcessTree";
import type { Delprosess } from "@/lib/types";

const delprosessOrder: Delprosess[] = ["PLAN", "GJENNOMFØRING", "STYRING"];

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export default function AdminPage() {
  const { hierarchy, loading, refetch } = useAppData();
  const [eiere, setEiere] = useState<Record<Delprosess, string> | null>(null);
  const [lagrer, setLagrer] = useState(false);

  if (loading || !hierarchy) {
    return <p className="text-sm text-slate-500">Laster admin...</p>;
  }

  const aktiveEiere = eiere ?? hierarchy.defaultOwners;
  const endret = JSON.stringify(aktiveEiere) !== JSON.stringify(hierarchy.defaultOwners);

  async function lagreEiere() {
    setLagrer(true);
    try {
      await fetch("/api/processes/defaults", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aktiveEiere),
      });
      await refetch();
      setEiere(null);
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin</h1>
        <p className="text-sm text-slate-500">
          Prosesshierarki etter APQC Process Classification Framework og prosesseiere.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-medium text-slate-900">Standard prosesseiere per delprosess</h2>
        <p className="mt-1 text-xs text-slate-500">
          Brukes som standard eier for alle prosesser i delprosessen, med mindre en enkeltprosess har en
          bekreftet, overstyrt eier i hierarkiet under.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {delprosessOrder.map((d) => (
            <label key={d} className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{d}</span>
              <input
                className={inputClass}
                value={aktiveEiere[d]}
                onChange={(e) => setEiere({ ...aktiveEiere, [d]: e.target.value })}
              />
            </label>
          ))}
        </div>
        {endret && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={lagreEiere}
              disabled={lagrer}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {lagrer ? "Lagrer..." : "Lagre eiere"}
            </button>
            <button
              onClick={() => setEiere(null)}
              className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Forkast
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">Ole Mjelde</span>, prosessleder digitalisering, har ansvar
          for prosessutvikling innenfor GJENNOMFØRING. Dette er en rolle knyttet til utvikling av prosessen, ikke
          et eierskap i linjen, og påvirker derfor ikke feltet prosesseier over.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-medium text-slate-900">Prosesshierarki</h2>
        <ProcessTree hierarchy={hierarchy} onChanged={refetch} />
      </div>
    </div>
  );
}
