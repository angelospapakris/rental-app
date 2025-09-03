// src/pages/owner/OwnerViewings.tsx
import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import type { ViewingStatus } from "@/types";

/* ---- helpers: γύρνα ΠΑΝΤΑ array ---- */
function toArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  if (Array.isArray(res?.content)) return res.content as T[];
  return [];
}

/* ---- types ---- */
type Viewing = {
  id: number;
  status: ViewingStatus; // "REQUESTED" | "CONFIRMED" | "DECLINED" | "COMPLETED"
  propertyId: number;
  tenantId?: number;
  notes?: string;        // <-- from DB
};
type Property = { id: number; title?: string };

export default function OwnerViewings() {
  const qc = useQueryClient();

  // 1) Αιτήματα προβολών του ιδιοκτήτη
  const viewingsQ = useQuery({
    queryKey: ["owner-viewings"],
    queryFn: () => api.get<any>(ENDPOINTS.viewings.ownerViews),
    select: (res) => toArray<Viewing>(res),
  });

  // 2) Τίτλοι ακινήτων: /my -> fallback /public
  const propsQ = useQuery({
    queryKey: ["properties-for-titles"],
    queryFn: async () => {
      try {
        return await api.get<any>(ENDPOINTS.myProps);
      } catch {
        return await api.get<any>(ENDPOINTS.properties.publicProps);
      }
    },
    select: (res) => toArray<Property>(res),
    staleTime: 5 * 60 * 1000,
  });

  // 3) id -> title από τα (my/public) properties
  const baseTitleMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of propsQ.data ?? []) {
      if (typeof p?.id === "number") m.set(p.id, p.title ?? "");
    }
    return m;
  }, [propsQ.data]);

  // 4) Αν κάποιο viewing δεν έχει τίτλο ακόμη, φέρε το property per-id (robust fallback)
  const missingIds = useMemo(() => {
    const list = viewingsQ.data ?? [];
    const ids: number[] = [];
    for (const v of list) {
      if (!baseTitleMap.has(v.propertyId)) ids.push(v.propertyId);
    }
    // μοναδικά
    return Array.from(new Set(ids));
  }, [viewingsQ.data, baseTitleMap]);

  const missingPropsQueries = useQueries({
    queries: missingIds.map((id) => ({
      queryKey: ["property", id],
      queryFn: () => api.get<any>(ENDPOINTS.properties.byId(id)),
      select: (res: any) => {
        const obj: Property | undefined =
          (res && typeof res === "object" && res) ||
          (res?.data && typeof res.data === "object" && res.data);
        return obj;
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  // 5) Συγχώνευση τίτλων από όλα τα sources
  const titleById = useMemo(() => {
    const m = new Map(baseTitleMap); // ξεκινάει από my/public
    missingPropsQueries.forEach((q, i) => {
      const id = missingIds[i];
      const p = q.data as Property | undefined;
      if (p && typeof p.id === "number") {
        m.set(p.id, p.title ?? "");
      }
    });
    return m;
  }, [baseTitleMap, missingPropsQueries, missingIds]);

  // 6) Mutations
  const confirm = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.viewings.confirm(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-viewings"] }),
  });
  const decline = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.viewings.decline(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-viewings"] }),
  });
  const complete = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.viewings.complete(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-viewings"] }),
  });

  // 7) UI
  if (viewingsQ.isLoading || propsQ.isLoading) return <Loading />;
  if (viewingsQ.error)
    return <p className="p-6 text-red-600">Σφάλμα φόρτωσης αιτημάτων προβολής</p>;

  const list = viewingsQ.data ?? [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Αιτήματα προβολών</h1>

      {list.length === 0 ? (
        <p className="text-muted-foreground">Δεν υπάρχουν αιτήματα.</p>
      ) : (
        list.map((v) => {
          const title = titleById.get(v.propertyId) || `Ακίνητο ${v.propertyId}`;

          // enable/disable βάσει status
          const confirmDisabled  = v.status !== "REQUESTED" || confirm.isPending;
          const declineDisabled  = v.status !== "REQUESTED" || decline.isPending;
          const completeDisabled = v.status !== "CONFIRMED" || complete.isPending;

          return (
            <div
              key={v.id}
              className="p-4 border rounded-2xl flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{title}</div>
                 {v.notes && (
                                  <div className="text-sm italic text-muted-foreground">
                                    Σημειώσεις: {v.notes}
                                  </div>
                                )}
                <div className="text-sm text-muted-foreground">
                  Κατάσταση: {v.status}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => confirm.mutate(v.id)} disabled={confirmDisabled}>
                  {confirm.isPending ? "Επιβεβαίωση..." : "Επιβεβαίωση"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => decline.mutate(v.id)}
                  disabled={declineDisabled}
                >
                  {decline.isPending ? "Απόρριψη..." : "Απόρριψη"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => complete.mutate(v.id)}
                  disabled={completeDisabled}
                >
                  {complete.isPending ? "Ολοκληρώθηκε..." : "Ολοκληρώθηκε"}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
