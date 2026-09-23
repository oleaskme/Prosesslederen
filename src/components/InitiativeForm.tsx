"use client";

import { useEffect, useState } from "react";
import {
  fremdriftLabels,
  fremdriftOptions,
  kompleksitetLabels,
  kompleksitetOptions,
  nivaaLabels,
  nivaaOptions,
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
import { buttonDanger, buttonGhost, buttonPrimary, inputClass } from "@/lib/ui";

export type InitiativFormValues = Omit<Initiativ, "id" | "opprettet" | "oppdatert">;

const tomtSkjema: InitiativFormValues = {
  navn: "",
  beskrivelse: "",
  berortProcessId: "",
  effektForventet: "",
  effektMaaling: "",
  ressursbruksNivaa: "lav",
  ressursbruksKommentar: "",
  gevinsteier: "",
  prosesseierId: "",
  status: "idé",
  fremdriftsstatus: "ikke påbegynt",
  ragStatus: "green",
  tidsperspektiv: "na",
  kompleksitet: "lav",
  avhengigheter: "",
  leverandorbinding: false,
  leverandorbindingKommentar: "",
  risikoSannsynlighet: 1,
  risikoKonsekvens: 1,
  gevinstMaalbar: false,
  gevinstMaalbarKommentar: "",
};

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
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
          ressursbruksNivaa: initial.ressursbruksNivaa,
          ressursbruksKommentar: initial.ressursbruksKommentar,
          gevinsteier: initial.gevinsteier,
          prosesseierId: initial.prosesseierId,
          status: initial.status,
          fremdriftsstatus: initial.fremdriftsstatus,
          ragStatus: initial.ragStatus,
          tidsperspektiv: initial.tidsperspektiv,
          kompleksitet: initial.kompleksitet,
          avhengigheter: initial.avhengigheter,
          leverandorbinding: initial.leverandorbinding,
          leverandorbindingKommentar: initial.leverandorbindingKommentar,
          risikoSannsynlighet: initial.risikoSannsynlighet,
          risikoKonsekvens: initial.risikoKonsekvens,
          gevinstMaalbar: initial.gevinstMaalbar,
          gevinstMaalbarKommentar: initial.gevinstMaalbarKommentar,
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

  const fremdriftRelevant = values.status === "pågår" || values.status === "i drift";

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Felt label="Ressursbruk, anslått nivå">
          <select
            className={inputClass}
            value={values.ressursbruksNivaa}
            onChange={(e) => set("ressursbruksNivaa", e.target.value as InitiativFormValues["ressursbruksNivaa"])}
          >
            {nivaaOptions.map((n) => (
              <option key={n} value={n}>
                {nivaaLabels[n]}
              </option>
            ))}
          </select>
        </Felt>
        <Felt label="Ressursbruk, kommentar">
          <input
            className={inputClass}
            value={values.ressursbruksKommentar}
            onChange={(e) => set("ressursbruksKommentar", e.target.value)}
          />
        </Felt>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Felt label="Gevinsteier (navngitt person i linjen)">
          <input
            className={inputClass}
            value={values.gevinsteier}
            onChange={(e) => set("gevinsteier", e.target.value)}
          />
        </Felt>
        <Felt label="Prosesseier">
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
      </div>

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
        <Felt label="Fremdriftsstatus">
          <select
            className={`${inputClass} ${!fremdriftRelevant ? "opacity-50" : ""}`}
            value={values.fremdriftsstatus}
            onChange={(e) => set("fremdriftsstatus", e.target.value as InitiativFormValues["fremdriftsstatus"])}
            disabled={!fremdriftRelevant}
          >
            {fremdriftOptions.map((f) => (
              <option key={f} value={f}>
                {fremdriftLabels[f]}
              </option>
            ))}
          </select>
          {!fremdriftRelevant && (
            <span className="mt-1 block text-xs text-slate-400">
              Kun relevant når status er pågår eller i drift.
            </span>
          )}
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

      <Felt label="Avhengigheter (for eksempel andre systemendringer)">
        <textarea
          className={inputClass}
          rows={2}
          value={values.avhengigheter}
          onChange={(e) => set("avhengigheter", e.target.value)}
        />
      </Felt>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Leverandørbinding</span>
          <div className="flex gap-4 py-1">
            <label className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                className="accent-indigo-600"
                checked={values.leverandorbinding}
                onChange={() => set("leverandorbinding", true)}
              />
              Ja
            </label>
            <label className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                className="accent-indigo-600"
                checked={!values.leverandorbinding}
                onChange={() => set("leverandorbinding", false)}
              />
              Nei
            </label>
          </div>
        </div>
        <Felt label="Leverandørbinding, kommentar">
          <input
            className={inputClass}
            value={values.leverandorbindingKommentar}
            onChange={(e) => set("leverandorbindingKommentar", e.target.value)}
          />
        </Felt>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Risiko for tillit</span>
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Kan gevinsten måles</span>
          <div className="flex gap-4 py-1">
            <label className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                className="accent-indigo-600"
                checked={values.gevinstMaalbar}
                onChange={() => set("gevinstMaalbar", true)}
              />
              Ja
            </label>
            <label className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                className="accent-indigo-600"
                checked={!values.gevinstMaalbar}
                onChange={() => set("gevinstMaalbar", false)}
              />
              Nei
            </label>
          </div>
        </div>
        <Felt label="Kan gevinsten måles, kommentar">
          <input
            className={inputClass}
            value={values.gevinstMaalbarKommentar}
            onChange={(e) => set("gevinstMaalbarKommentar", e.target.value)}
          />
        </Felt>
      </div>

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
