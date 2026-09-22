"use client";

import Modal from "@/components/Modal";
import InitiativeForm, { InitiativFormValues } from "@/components/InitiativeForm";
import type { ProcessOption } from "@/lib/processHelpers";
import type { Initiativ } from "@/lib/types";

export default function InitiativeModal({
  mode,
  initiativ,
  processOptions,
  onClose,
  onSaved,
  onDeleted,
}: {
  mode: "ny" | "rediger";
  initiativ?: Initiativ;
  processOptions: ProcessOption[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  async function handleSubmit(values: InitiativFormValues) {
    if (mode === "ny") {
      await fetch("/api/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } else if (initiativ) {
      await fetch(`/api/initiatives/${initiativ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    }
    onSaved();
  }

  async function handleDelete() {
    if (!initiativ) return;
    if (!confirm(`Slette initiativet «${initiativ.navn}»?`)) return;
    await fetch(`/api/initiatives/${initiativ.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <Modal title={mode === "ny" ? "Nytt initiativ" : initiativ?.navn ?? "Rediger initiativ"} onClose={onClose}>
      <InitiativeForm
        initial={initiativ}
        processOptions={processOptions}
        onSubmit={handleSubmit}
        onDelete={mode === "rediger" ? handleDelete : undefined}
        onCancel={onClose}
        submitLabel={mode === "ny" ? "Opprett" : "Lagre endringer"}
      />
    </Modal>
  );
}
