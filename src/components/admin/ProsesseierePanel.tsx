"use client";

import { useState } from "react";
import type { Delprosess, ProcessHierarchy } from "@/lib/types";
import { buttonGhost, buttonPrimary, cardAccent, inputClass } from "@/lib/ui";
import EiereRegister from "@/components/admin/EiereRegister";

const delprosessOrder: Delprosess[] = ["PLAN", "GJENNOMFØRING", "STYRING"];

export default function ProsesseierePanel({
  hierarchy,
  onChanged,
}: {
  hierarchy: ProcessHierarchy;
  onChanged: () => Promise<void>;
}) {
  const [eiere, setEiere] = useState<Record<Delprosess, string> | null>(null);
  const [lagrer, setLagrer] = useState(false);

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
      await onChanged();
      setEiere(null);
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Prosesseiere</h2>
        <p className="mt-1 text-sm text-slate-500">
          Prosesseier er personen i linjen som eier prosessen. Dette er ikke det samme som
          gevinsteier, som settes per initiativ i fane Initiativoversikt.
        </p>
      </div>

      <EiereRegister />

      <div className={cardAccent("indigo")}>
        <h3 className="font-medium text-slate-900">Standard prosesseiere per delprosess</h3>
        <p className="mt-1 text-xs text-slate-500">
          Brukes som standard eier for alle prosesser i delprosessen, med mindre en enkeltprosess har en
          bekreftet, overstyrt eier i prosesshierarkiet.
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
            <button onClick={lagreEiere} disabled={lagrer} className={buttonPrimary}>
              {lagrer ? "Lagrer..." : "Lagre eiere"}
            </button>
            <button onClick={() => setEiere(null)} className={buttonGhost}>
              Forkast
            </button>
          </div>
        )}
      </div>

      <div className={cardAccent("teal")}>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Ole Mjelde</span>, prosessleder digitalisering, har ansvar
          for prosessutvikling innenfor GJENNOMFØRING. Dette er en rolle knyttet til utvikling av prosessen, ikke
          et eierskap i linjen, og påvirker derfor ikke standard prosesseiere over.
        </p>
      </div>
    </div>
  );
}
