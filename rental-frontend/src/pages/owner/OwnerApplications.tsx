// src/pages/owner/OwnerApplications.tsx
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

// ---- helpers: ΠΑΝΤΑ επιστρέφει array ----
function toArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res.data)) return res.data as T[];
  if (Array.isArray(res.content)) return res.content as T[];
  return [];
}

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
type AppItem = { id: number; message?: string; status: ApplicationStatus; tenantId: number; propertyId: number; };
type Property = { id: number; title?: string };

// ---- component ----
export default function OwnerApplications() {
  const qc = useQueryClient();

  // 1) Αιτήσεις ιδιοκτήτη (JSON σου: { data: [...] })
  const appsQ = useQuery({
    queryKey: ["owner-applications"],
    queryFn: () => api.get<any>(ENDPOINTS.applications.ownerApps),
    select: (res) => toArray<AppItem>(res),
  });

  // 2) Properties για ΤΙΤΛΟΥΣ
  //    - Προσπαθεί πρώτα /api/properties/my (OWNER only)
  //    - Αν σκάσει (401/403/500), πέφτει σε /api/properties (public, approved)
  const propsQ = useQuery({
    queryKey: ["owner-or-public-properties-for-titles"],
    queryFn: async () => {
      try {
        return await api.get<any>(ENDPOINTS.myProps); // /api/properties/my
      } catch {
        return await api.get<any>(ENDPOINTS.properties.publicProps); // fallback
      }
    },
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

  // 4) Approve/Reject
  const approve = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.applications.approve(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-applications"] }),
  });
  const reject = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.applications.reject(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-applications"] }),
  });

  // 5) UI
  if (appsQ.isLoading || propsQ.isLoading) return <Loading />;
  if (appsQ.error) return <p className="p-6 text-red-600">Σφάλμα φόρτωσης αιτήσεων</p>;

  const apps = appsQ.data ?? [];

  return (
     <div className="max-w-5xl mx-auto p-4 space-y-3">
       <h1 className="text-2xl font-semibold">Αιτήσεις για τα ακίνητά μου</h1>

       {apps.length === 0 ? (
         <p className="text-muted-foreground">Δεν υπάρχουν αιτήσεις.</p>
       ) : (
         apps.map((a) => {
           const title = titleById.get(a.propertyId) || `Ακίνητο ${a.propertyId}`;
           const disable = a.status !== "PENDING" || approve.isPending || reject.isPending;

           return (
             <div key={a.id} className="p-4 border rounded-2xl flex items-center justify-between">
               <div>
                 <div className="font-medium">{title}</div>
                 <div className="text-sm text-muted-foreground">Ενοικιαστής: Χρήστης {a.tenantId}</div>
                 {a.message && <div className="text-sm italic text-muted-foreground">Μήνυμα: {a.message}</div>}
                 <div className="text-sm mt-1">Κατάσταση: {a.status}</div>
               </div>
               <div className="flex gap-2">
                 <Button onClick={() => approve.mutate(a.id)} disabled={disable}>
                   {approve.isPending ? "Έγκριση..." : "Έγκριση"}
                 </Button>
                 <Button variant="outline" onClick={() => reject.mutate(a.id)} disabled={disable}>
                   {reject.isPending ? "Απόρριψη..." : "Απόρριψη"}
                 </Button>
               </div>
             </div>
           );
         })
       )}
     </div>
  );
}
