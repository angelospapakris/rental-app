// src/pages/tenant/MyApplications.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import { Link } from "react-router-dom";
import type { ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/button"; // θα το χρησιμοποιήσουμε σαν “badge” appearance

// ---- helpers: ΠΑΝΤΑ επιστρέφει array ----
function toArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res.data)) return res.data as T[];
  if (Array.isArray(res.content)) return res.content as T[];
  return [];
}

type AppItem = {
  id: number;
  message?: string;
  status: ApplicationStatus;
  propertyId: number;
  createdAt?: string;
};
type Property = { id: number; title?: string };

// mapping για εμφάνιση status
const STATUS_UI: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  PENDING:   { label: "Σε αναμονή", className: "bg-gray-300 text-gray-900 hover:bg-gray-300" },
  APPROVED:  { label: "Εγκρίθηκε",  className: "bg-green-600 text-white hover:bg-green-600" },
  REJECTED:  { label: "Απορρίφθηκε", className: "bg-red-600 text-white hover:bg-red-600" },
};

export default function MyApplications() {
  // 1) Οι αιτήσεις μου
  const appsQ = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => api.get<any>(ENDPOINTS.applications.tenantApps),
    select: (res) => toArray<AppItem>(res),
  });

  // 2) Τίτλοι ακινήτων
  const propsQ = useQuery({
    queryKey: ["public-properties-for-titles"],
    queryFn: () => api.get<any>(ENDPOINTS.properties.publicProps),
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

  if (appsQ.isLoading || propsQ.isLoading) return <Loading />;
  if (appsQ.error) return <p className="p-6 text-red-600">Σφάλμα φόρτωσης αιτήσεων</p>;

  const apps = appsQ.data ?? [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Οι αιτήσεις μου</h1>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">Δεν έχετε υποβάλει αιτήσεις ακόμη.</p>
      ) : (
        apps.map((a) => {
          const title = titleById.get(a.propertyId) || `Ακίνητο ${a.propertyId}`;
          const ui = STATUS_UI[a.status] ?? STATUS_UI.PENDING;

          return (
            <div
              key={a.id}
              className="p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                    {title}
                </div>
                {a.message && (
                  <div className="text-sm italic text-muted-foreground mt-1 line-clamp-3">
                    Μήνυμα: {a.message}
                  </div>
                )}
                {a.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Υποβλήθηκε: {new Date(a.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Status “σαν κουμπί”, δεξιά */}
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
