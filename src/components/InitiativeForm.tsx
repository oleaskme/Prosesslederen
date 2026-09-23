"use client";

import { useEffect, useState } from "react";
import {
  faseLabels,
  faseOptions,
  kompleksitetLabels,
  kompleksitetOptions,
  ragLabels,
  ragOptions,
  risikoSkalaLabels,
  risikoSkalaOptions,
  statusLabels,
  statusOptions,
  tidsperspektivLabels,
  tidsperspektivOptions,
} from "@/lib/labels";
import type { ProcessOption } from "@/lib/processHelpers";
import type { Initiativ, ProsessEier } from "@/lib/types";
import { buttonDanger, buttonGhost, buttonPrimary, cardAccent, inputClass } from "@/lib/ui";

export type InitiativFormValues = Omit<Initiativ, "id" | "opprettet" | "oppdatert">;

const tomtSkjema: InitiativFormValues = {
  navn: "",
  beskrivelse: "",
  berortProcessId: "",
  effektForventet: "",
  effektMaaling: "",
  prosesseierId: "",
  subjectMatterExpertId: "",
  fase: "idéfase",
  status: "ikke påbegynt",
  ragStatus: "green",
  tidsperspektiv: "na",
  kompleksitet: "lav",
  avhengighetTeknologi: "",
  avhengighetProsess: "",
  avhengighetKompetanse: "",
  risikoSannsynlighet: 1,
  risikoKonsekvens: 1,
};

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Seksjon({
  tittel,
  farge,
  children,
}: {
  tittel: string;
  farge: Parameters<typeof cardAccent>[0];
  children: React.ReactNode;
}) {
  return (
    <div className={cardAccent(farge)}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{tittel}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function InitiativeForm({
  initial,
  processOptions,
  onSubmit,
  onDelete,
  onCancel,
  submitLabel = "Lagre",
}: {
  initial?: Initiativ;
  processOptions: ProcessOption[];
  onSubmit: (values: InitiativFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<InitiativFormValues>(
    initial
      ? {
          navn: initial.navn,
          beskrivelse: initial.beskrivelse,
          berortProcessId: initial.berortProcessId,
          effektForventet: initial.effektForventet,
          effektMaaling: initial.effektMaaling,
          prosesseierId: initial.prosesseierId,
          subjectMatterExpertId: initial.subjectMatterExpertId,
          fase: initial.fase,
          status: initial.status,
          ragStatus: initial.ragStatus,
          tidsperspektiv: initial.tidsperspektiv,
          kompleksitet: initial.kompleksitet,
          avhengighetTeknologi: initial.avhengighetTeknologi,
          avhengighetProsess: initial.avhengighetProsess,
          avhengighetKompetanse: initial.avhengighetKompetanse,
          risikoSannsynlighet: initial.risikoSannsynlighet,
          risikoKonsekvens: initial.risikoKonsekvens,
        }
      : { ...tomtSkjema, berortProcessId: processOptions[0]?.id ?? "" }
  );
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [eiere, setEiere] = useState<ProsessEier[]>([]);

  useEffect(() => {
    async function hentEiere() {
      const res = await fetch("/api/eiere", { cache: "no-store" });
      const data = await res.json();
      setEiere(data);
    }
    hentEiere();
  }, []);

  function set<K extends keyof InitiativFormValues>(key: K, value: InitiativFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.navn.trim()) {
      setFeil("Navn er påkrevd.");
      return;
    }
    if (!values.berortProcessId) {
      setFeil("Velg en berørt prosess.");
      return;
    }
    setFeil(null);
    setLagrer(true);
    try {
      await onSubmit(values);
    } finally {
      setLagrer(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {feil && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {feil}
        </div>
      )}

      <Seksjon tittel="Om initiativet" farge="slate">
        <Felt label="Navn">
          <input
            className={inputClass}
            value={values.navn}
            onChange={(e) => set("navn", e.target.value)}
            placeholder="Kort, gjenkjennelig navn på initiativet"
          />
        </Felt>

        <Felt label="Kort beskrivelse">
          <textarea
            className={inputClass}
            rows={2}
            value={values.beskrivelse}
            onChange={(e) => set("beskrivelse", e.target.value)}
          />
        </Felt>

        <Felt label="Berørt (del)prosess">
          <select
            className={inputClass}
            value={values.berortProcessId}
            onChange={(e) => set("berortProcessId", e.target.value)}
          >
            <option value="" disabled>
              Velg prosess
            </option>
            {processOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Felt>
      </Seksjon>

      <Seksjon tittel="Effekt" farge="indigo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Felt label="Effekt, forventet">
            <textarea
              className={inputClass}
              rows={2}
              value={values.effektForventet}
              onChange={(e) => set("effektForventet", e.target.value)}
            />
          </Felt>
          <Felt label="Hvordan effekten skal måles">
            <textarea
              className={inputClass}
              rows={2}
              value={values.effektMaaling}
              onChange={(e) => set("effektMaaling", e.target.value)}
            />
          </Felt>
        </div>
      </Seksjon>

      <Seksjon tittel="Ansvarlige" farge="teal">
        <div className="grid gap-4 sm:grid-cols-2">
          <Felt label="Prosesseier (navngitt person i linjen)">
            <select
              className={inputClass}
              value={values.prosesseierId}
              onChange={(e) => set("prosesseierId", e.target.value)}
            >
              <option value="">Ikke satt</option>
              {eiere.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.navn} · {e.avdeling}
                </option>
              ))}
            </select>
          </Felt>
          <Felt label="Subject matter expert">
            <select
              className={inputClass}
              value={values.subjectMatterExpertId}
              onChange={(e) => set("subjectMatterExpertId", e.target.value)}
            >
              <option value="">Ikke satt</option>
              {eiere.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.navn} · {e.avdeling}
                </option>
              ))}
            </select>
          </Felt>
        </div>
      </Seksjon>

      <Seksjon tittel="Status og fremdrift" farge="amber">
        <div className="grid gap-4 sm:grid-cols-3">
          <Felt label="Status">
            <select
              className={inputClass}
              value={values.status}
              onChange={(e) => set("status", e.target.value as InitiativFormValues["status"])}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </Felt>
          <Felt label="Fase">
            <select
              className={inputClass}
              value={values.fase}
              onChange={(e) => set("fase", e.target.value as InitiativFormValues["fase"])}
            >
              {faseOptions.map((s) => (
                <option key={s} value={s}>
                  {faseLabels[s]}
                </option>
              ))}
            </select>
          </Felt>
          <Felt label="RAG-status">
            <select
              className={inputClass}
              value={values.ragStatus}
              onChange={(e) => set("ragStatus", e.target.value as InitiativFormValues["ragStatus"])}
            >
              {ragOptions.map((r) => (
                <option key={r} value={r}>
                  {ragLabels[r]}
                </option>
              ))}
            </select>
          </Felt>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Felt label="Tidsperspektiv">
            <select
              className={inputClass}
              value={values.tidsperspektiv}
              onChange={(e) => set("tidsperspektiv", e.target.value as InitiativFormValues["tidsperspektiv"])}
            >
              {tidsperspektivOptions.map((t) => (
                <option key={t} value={t}>
                  {tidsperspektivLabels[t]}
                </option>
              ))}
            </select>
          </Felt>
          <Felt label="Kompleksitet">
            <select
              className={inputClass}
              value={values.kompleksitet}
              onChange={(e) => set("kompleksitet", e.target.value as InitiativFormValues["kompleksitet"])}
            >
              {kompleksitetOptions.map((k) => (
                <option key={k} value={k}>
                  {kompleksitetLabels[k]}
                </option>
              ))}
            </select>
          </Felt>
        </div>
      </Seksjon>

      <Seksjon tittel="Avhengigheter" farge="sky">
        <div className="grid gap-4 sm:grid-cols-3">
          <Felt label="Teknologi">
            <textarea
              className={inputClass}
              rows={2}
              value={values.avhengighetTeknologi}
              onChange={(e) => set("avhengighetTeknologi", e.target.value)}
            />
          </Felt>
          <Felt label="Prosess">
            <textarea
              className={inputClass}
              rows={2}
              value={values.avhengighetProsess}
              onChange={(e) => set("avhengighetProsess", e.target.value)}
            />
          </Felt>
          <Felt label="Kompetanse">
            <textarea
              className={inputClass}
              rows={2}
              value={values.avhengighetKompetanse}
              onChange={(e) => set("avhengighetKompetanse", e.target.value)}
            />
          </Felt>
        </div>
      </Seksjon>

      <Seksjon tittel="Risikovurdering" farge="rose">
        <div className="grid gap-4 sm:grid-cols-2">
          <Felt label="Sannsynlighet">
            <select
              className={inputClass}
              value={values.risikoSannsynlighet}
              onChange={(e) => set("risikoSannsynlighet", Number(e.target.value) as InitiativFormValues["risikoSannsynlighet"])}
            >
              {risikoSkalaOptions.map((n) => (
                <option key={n} value={n}>
                  {n} · {risikoSkalaLabels[n]}
                </option>
              ))}
            </select>
          </Felt>
          <Felt label="Konsekvens">
            <select
              className={inputClass}
              value={values.risikoKonsekvens}
              onChange={(e) => set("risikoKonsekvens", Number(e.target.value) as InitiativFormValues["risikoKonsekvens"])}
            >
              {risikoSkalaOptions.map((n) => (
                <option key={n} value={n}>
                  {n} · {risikoSkalaLabels[n]}
                </option>
              ))}
            </select>
          </Felt>
        </div>
      </Seksjon>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div>
          {onDelete && (
            <button type="button" onClick={onDelete} className={buttonDanger}>
              Slett initiativ
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className={buttonGhost}>
            Avbryt
          </button>
          <button type="submit" disabled={lagrer} className={buttonPrimary}>
            {lagrer ? "Lagrer..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
