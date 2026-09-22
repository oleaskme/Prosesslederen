export const buttonPrimary =
  "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:hover:bg-indigo-600";

export const buttonSecondary =
  "rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors";

export const buttonGhost =
  "rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors";

export const buttonDanger =
  "rounded-md px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors";

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

export const selectClass =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

export const card = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

const accentBorders = {
  indigo: "border-l-indigo-500",
  teal: "border-l-teal-500",
  amber: "border-l-amber-500",
  rose: "border-l-rose-500",
} as const;

export function cardAccent(color: keyof typeof accentBorders = "indigo") {
  return `rounded-xl border border-slate-200 border-l-4 ${accentBorders[color]} bg-white p-4 shadow-sm`;
}
