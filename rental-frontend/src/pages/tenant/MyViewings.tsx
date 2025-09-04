// src/pages/tenant/NewViewing.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ViewingStatus } from "@/types";

// ---- helpers: ΠΑΝΤΑ επιστρέφει array ----
function toArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  if (Array.isArray(res?.content)) return res.content as T[];
  return [];
}

// ---- types ----
type Viewing = {
  id: number;
  propertyId: number;
  status: ViewingStatus;         // "REQUESTED" | "CONFIRMED" | "DECLINED" | "COMPLETED"
  notes?: string;                // <-- εδώ δείχνουμε το notes
  createdAt?: string;
};
type Property = { id: number; title?: string };

// ---- status → UI mapping ----
const STATUS_UI: Record<
  ViewingStatus,
  { label: string; className: string }
> = {
  REQUESTED: { label: "Αιτήθηκε",     className: "bg-gray-300 text-gray-900 hover:bg-gray-300" },
  CONFIRMED: { label: "Επιβεβαιώθηκε", className: "bg-green-600 text-white hover:bg-green-600" },
  DECLINED:  { label: "Απορρίφθηκε",  className: "bg-red-600 text-white hover:bg-red-600" },
  COMPLETED: { label: "Ολοκληρώθηκε", className: "bg-slate-700 text-white hover:bg-blue-700" },
};

export default function NewViewing() {
  // 1) Τα δικά μου αιτήματα προβολής (tenant)
  const viewingsQ = useQuery({
    queryKey: ["tenant-viewings"],
    queryFn: () => api.get<any>(ENDPOINTS.viewings.tenantViews), // π.χ. "/api/viewings/my"
    select: (res) => toArray<Viewing>(res),
  });

  // 2) Τίτλοι ακινήτων (public λίστα αρκεί για εμφάνιση)
  const propsQ = useQuery({
    queryKey: ["public-properties-for-titles"],
    queryFn: () => api.get<any>(ENDPOINTS.publicProps),
    select: (res) => toArray<Property>(res),
    staleTime: 5 * 60 * 1000,
  });

  // 3) Χάρτης id -> title
  const titleById = useMemo(() => {
    const m = new Map<number, string>();
    (propsQ.data ?? []).forEach((p) => {
      if (typeof p?.id === "number") m.set(p.id, p.title ?? "");
    });
    return m;
  }, [propsQ.data]);

  if (viewingsQ.isLoading || propsQ.isLoading) return <Loading />;
  if (viewingsQ.error)
    return <p className="p-6 text-red-600">Σφάλμα φόρτωσης προβολών</p>;

  const list = viewingsQ.data ?? [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Οι προβολές μου</h1>

      {list.length === 0 ? (
        <p className="text-muted-foreground">Δεν έχετε αιτήματα προβολής ακόμα.</p>
      ) : (
        list.map((v) => {
          const title = titleById.get(v.propertyId) || `Ακίνητο ${v.propertyId}`;
          const ui = STATUS_UI[v.status] ?? STATUS_UI.REQUESTED;

          return (
            <div
              key={v.id}
              className="p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                    {title}
                </div>

                {v.notes && (
                  <div className="text-sm italic text-muted-foreground mt-1 line-clamp-3">
                    Σημειώσεις: {v.notes}
                  </div>
                )}

                {v.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Υποβλήθηκε: {new Date(v.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Status “σαν badge” */}
              <Button
                type="button"
                role="status"
                tabIndex={-1}
                disabled
                className={`pointer-events-none rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium ${ui.className}`}
              >
                {ui.label}
              </Button>
            </div>
          );
        })
      )}
    </div>
  );
}
