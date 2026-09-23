"use client";

import InitiativeForm, { InitiativFormValues } from "@/components/InitiativeForm";
import type { ProcessOption } from "@/lib/processHelpers";
import type { Initiativ } from "@/lib/types";

export default function InitiativePanel({
  mode,
  initiativ,
  processOptions,
  onCancel,
  onSaved,
  onDeleted,
}: {
  mode: "ny" | "rediger";
  initiativ?: Initiativ;
  processOptions: ProcessOption[];
  onCancel: () => void;
  onSaved: (nyId?: string) => void;
  onDeleted: () => void;
}) {
  async function handleSubmit(values: InitiativFormValues) {
    if (mode === "ny") {
      const res = await fetch("/api/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const opprettet = await res.json();
      onSaved(opprettet.id);
    } else if (initiativ) {
      await fetch(`/api/initiatives/${initiativ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      onSaved();
    }
  }

  async function handleDelete() {
    if (!initiativ) return;
    if (!confirm(`Slette initiativet «${initiativ.navn}»?`)) return;
    await fetch(`/api/initiatives/${initiativ.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        {mode === "ny" ? "Nytt initiativ" : initiativ?.navn}
      </h2>
      <InitiativeForm
        key={initiativ?.id ?? "ny"}
        initial={initiativ}
        processOptions={processOptions}
        onSubmit={handleSubmit}
        onDelete={mode === "rediger" ? handleDelete : undefined}
        onCancel={onCancel}
        submitLabel={mode === "ny" ? "Opprett" : "Lagre endringer"}
      />
    </div>
  );
}
