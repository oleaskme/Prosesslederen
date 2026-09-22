import type { ProcessHierarchy } from "./types";

export interface ProcessOption {
  id: string;
  label: string;
}

export function getProcessOptions(hierarchy: ProcessHierarchy): ProcessOption[] {
  return hierarchy.level3.map((l3) => {
    const l2 = hierarchy.level2.find((n) => n.id === l3.level2Id);
    const l1 = l2 ? hierarchy.level1.find((n) => n.id === l2.level1Id) : undefined;
    const path = [l1?.kode, l2?.navn, l3.navn].filter(Boolean).join(" · ");
    return { id: l3.id, label: path };
  });
}

export function getProcessLabel(hierarchy: ProcessHierarchy, level3Id: string): string {
  const options = getProcessOptions(hierarchy);
  return options.find((o) => o.id === level3Id)?.label ?? "Ukjent prosess";
}

export function getProcessOwner(hierarchy: ProcessHierarchy, level3Id: string): string {
  const l3 = hierarchy.level3.find((n) => n.id === level3Id);
  if (!l3) return "Ukjent";
  return l3.eierOverstyring || hierarchy.defaultOwners[l3.delprosess];
}
