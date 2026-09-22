"use client";

import { useState } from "react";
import { relevansLabels, relevansOptions } from "@/lib/labels";
import type { Delprosess, ProcessHierarchy } from "@/lib/types";
import { RelevansBadge } from "@/components/Badges";

const delprosessOptions: Delprosess[] = ["PLAN", "GJENNOMFØRING", "STYRING"];

const inputClass =
  "rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

async function putNode(id: string, body: Record<string, unknown>) {
  await fetch(`/api/processes/node/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function deleteNode(id: string) {
  const res = await fetch(`/api/processes/node/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.error ?? "Kunne ikke slette.");
    return false;
  }
  return true;
}

async function postNode(body: Record<string, unknown>) {
  await fetch("/api/processes/node", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default function ProcessTree({
  hierarchy,
  onChanged,
}: {
  hierarchy: ProcessHierarchy;
  onChanged: () => Promise<void>;
}) {
  const [apen, setApen] = useState<Record<string, boolean>>({ "l1-09": true });

  const level1Sortert = [...hierarchy.level1].sort((a, b) => a.kode.localeCompare(b.kode, "en", { numeric: true }));

  return (
    <div className="space-y-2">
      {level1Sortert.map((l1) => {
        const level2 = hierarchy.level2.filter((n) => n.level1Id === l1.id);
        const erApen = !!apen[l1.id];
        return (
          <div key={l1.id} className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <button
                onClick={() => setApen((a) => ({ ...a, [l1.id]: !a[l1.id] }))}
                className="w-5 text-slate-400 hover:text-slate-700"
                aria-label="Vis eller skjul underprosesser"
              >
                {erApen ? "▾" : "▸"}
              </button>
              <span className="w-12 font-mono text-sm text-slate-500">{l1.kode}</span>
              <span className="flex-1 font-medium text-slate-900">{l1.navn}</span>
              <RelevansBadge relevans={l1.relevans} />
              <select
                className={inputClass}
                value={l1.relevans}
                onChange={async (e) => {
                  await putNode(l1.id, { relevans: e.target.value });
                  await onChanged();
                }}
              >
                {relevansOptions.map((r) => (
                  <option key={r} value={r}>
                    {relevansLabels[r]}
                  </option>
                ))}
              </select>
            </div>

            {erApen && (
              <div className="space-y-3 border-t border-slate-100 px-4 py-3 pl-10">
                {level2.map((l2) => (
                  <Level2Row
                    key={l2.id}
                    level2Id={l2.id}
                    navn={l2.navn}
                    level3={hierarchy.level3.filter((n) => n.level2Id === l2.id)}
                    defaultOwners={hierarchy.defaultOwners}
                    onChanged={onChanged}
                  />
                ))}
                <LeggTilLevel2 level1Id={l1.id} onChanged={onChanged} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Level2Row({
  level2Id,
  navn,
  level3,
  defaultOwners,
  onChanged,
}: {
  level2Id: string;
  navn: string;
  level3: ProcessHierarchy["level3"];
  defaultOwners: ProcessHierarchy["defaultOwners"];
  onChanged: () => Promise<void>;
}) {
  const [navnVerdi, setNavnVerdi] = useState(navn);

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <input
          className={`${inputClass} flex-1 bg-white`}
          value={navnVerdi}
          onChange={(e) => setNavnVerdi(e.target.value)}
          onBlur={async () => {
            if (navnVerdi !== navn) {
              await putNode(level2Id, { navn: navnVerdi });
              await onChanged();
            }
          }}
        />
        <button
          onClick={async () => {
            if (!confirm(`Slette prosessgruppen «${navn}» og alle underprosesser?`)) return;
            if (await deleteNode(level2Id)) await onChanged();
          }}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Slett
        </button>
      </div>

      <div className="mt-3 space-y-2 pl-4">
        {level3.map((l3) => (
          <div key={l3.id} className="flex flex-wrap items-center gap-2 rounded-md bg-white p-2">
            <Level3NavnInput id={l3.id} navn={l3.navn} onChanged={onChanged} />
            <select
              className={inputClass}
              value={l3.delprosess}
              onChange={async (e) => {
                await putNode(l3.id, { delprosess: e.target.value });
                await onChanged();
              }}
            >
              {delprosessOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <EierInput
              id={l3.id}
              standard={defaultOwners[l3.delprosess]}
              verdi={l3.eierOverstyring}
              onChanged={onChanged}
            />
            <button
              onClick={async () => {
                if (!confirm(`Slette prosessen «${l3.navn}»?`)) return;
                if (await deleteNode(l3.id)) await onChanged();
              }}
              className="ml-auto rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Slett
            </button>
          </div>
        ))}
        <LeggTilLevel3 level2Id={level2Id} onChanged={onChanged} />
      </div>
    </div>
  );
}

function Level3NavnInput({ id, navn, onChanged }: { id: string; navn: string; onChanged: () => Promise<void> }) {
  const [verdi, setVerdi] = useState(navn);
  return (
    <input
      className={`${inputClass} flex-1`}
      value={verdi}
      onChange={(e) => setVerdi(e.target.value)}
      onBlur={async () => {
        if (verdi !== navn) {
          await putNode(id, { navn: verdi });
          await onChanged();
        }
      }}
    />
  );
}

function EierInput({
  id,
  standard,
  verdi,
  onChanged,
}: {
  id: string;
  standard: string;
  verdi: string | null;
  onChanged: () => Promise<void>;
}) {
  const [tekst, setTekst] = useState(verdi ?? "");
  return (
    <input
      className={inputClass}
      placeholder={`Standard: ${standard}`}
      value={tekst}
      onChange={(e) => setTekst(e.target.value)}
      onBlur={async () => {
        if (tekst !== (verdi ?? "")) {
          await putNode(id, { eierOverstyring: tekst || null });
          await onChanged();
        }
      }}
    />
  );
}

function LeggTilLevel2({ level1Id, onChanged }: { level1Id: string; onChanged: () => Promise<void> }) {
  const [navn, setNavn] = useState("");
  return (
    <div className="flex items-center gap-2">
      <input
        className={`${inputClass} flex-1`}
        placeholder="Navn på ny nivå 2-prosess"
        value={navn}
        onChange={(e) => setNavn(e.target.value)}
      />
      <button
        onClick={async () => {
          if (!navn.trim()) return;
          await postNode({ type: "level2", level1Id, navn: navn.trim() });
          setNavn("");
          await onChanged();
        }}
        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        + Legg til nivå 2
      </button>
    </div>
  );
}

function LeggTilLevel3({ level2Id, onChanged }: { level2Id: string; onChanged: () => Promise<void> }) {
  const [navn, setNavn] = useState("");
  const [delprosess, setDelprosess] = useState<Delprosess>("GJENNOMFØRING");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className={`${inputClass} flex-1`}
        placeholder="Navn på ny nivå 3-prosess"
        value={navn}
        onChange={(e) => setNavn(e.target.value)}
      />
      <select className={inputClass} value={delprosess} onChange={(e) => setDelprosess(e.target.value as Delprosess)}>
        {delprosessOptions.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <button
        onClick={async () => {
          if (!navn.trim()) return;
          await postNode({ type: "level3", level2Id, navn: navn.trim(), delprosess });
          setNavn("");
          await onChanged();
        }}
        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        + Legg til nivå 3
      </button>
    </div>
  );
}
