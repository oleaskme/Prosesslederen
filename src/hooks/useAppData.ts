"use client";

import { useCallback, useEffect, useState } from "react";
import type { Initiativ, ProcessHierarchy } from "@/lib/types";

export function useAppData() {
  const [initiatives, setInitiatives] = useState<Initiativ[] | null>(null);
  const [hierarchy, setHierarchy] = useState<ProcessHierarchy | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const [initRes, procRes] = await Promise.all([
      fetch("/api/initiatives", { cache: "no-store" }),
      fetch("/api/processes", { cache: "no-store" }),
    ]);
    setInitiatives(await initRes.json());
    setHierarchy(await procRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // Henter data ved oppstart av siden. Løper i en effekt, ikke render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { initiatives, hierarchy, loading, refetch };
}
