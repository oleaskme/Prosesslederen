import { ragColor, ragLabels, relevansColor, relevansLabels } from "@/lib/labels";
import type { ProcessRelevans, RagStatus } from "@/lib/types";

export function RagBadge({ status }: { status: RagStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
      <span className={`h-2 w-2 rounded-full ${ragColor[status]}`} />
      {ragLabels[status]}
    </span>
  );
}

export function RelevansBadge({ relevans }: { relevans: ProcessRelevans }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${relevansColor[relevans]}`}>
      {relevansLabels[relevans]}
    </span>
  );
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "muted" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        tone === "muted" ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}
