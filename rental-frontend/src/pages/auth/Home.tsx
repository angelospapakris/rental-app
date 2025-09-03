import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import PropertyCard from "@/components/PropertyCard";
import Loading from "@/components/Loading";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Property, PagedResponse } from "@/types";

export default function Home() {
  const qc = useQueryClient();
  const { hasRole, user } = useAuth();

  function toArray<T>(res: any): T[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as T[];
    if (Array.isArray(res?.data)) return res.data as T[];
    if (Array.isArray(res?.content)) return res.content as T[];
    return [];
  }

  const isTenant = hasRole("TENANT");
  const tenantVerified = isTenant ? Boolean(user?.verified) : true; // tenants only
  const canTenantAct = !isTenant || tenantVerified;

  const { data: list = [], isLoading, error } = useQuery({
    queryKey: ["public-properties"],
    queryFn: () =>
      api.get<PagedResponse<Property> | Property[]>(ENDPOINTS.properties.publicProps),
    select: (res) => toArray<Property>(res),
  });

  const apply = useMutation({
    mutationFn: (payload: any) => api.post(ENDPOINTS.applications.submit, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
  });

  const requestViewing = useMutation({
    mutationFn: (payload: any) => api.post(ENDPOINTS.viewings.request, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-viewings"] }),
  });

  if (isLoading) return <Loading />;
  if (error) return <p className="p-6 text-red-600">{(error as Error).message}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-semibold">Διαθέσιμα ακίνητα</h1>

        {/* Badge για TENANT */}
        {isTenant && (
          <span
            className={
              "text-sm px-3 py-1 rounded-xl border " +
              (tenantVerified
                ? "border-green-500 text-green-700 bg-green-50"
                : "border-red-500 text-red-700 bg-red-50")
            }
            title={
              tenantVerified
                ? "Ο λογαριασμός είναι επαληθευμένος από διαχειριστή."
                : "Μη επαληθευμένος λογαριασμός. Οι ενέργειες είναι απενεργοποιημένες."
            }
          >
            {tenantVerified ? "Verified" : "Unverified"}
          </span>
        )}

        {/* Κουμπί ιδιοκτήτη */}
        {hasRole("OWNER") && (
          <Button asChild>
              <Link to="/createProps">+ Νέα καταχώριση</Link>
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="text-muted-foreground">Δεν βρέθηκαν ακίνητα.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              // ✅ Αν ο tenant δεν είναι verified, ΔΕΝ περνάμε handlers (κρύβονται/απενεργοποιούνται)
              onApply={
                canTenantAct && isTenant ? () => apply.mutate({ propertyId: p.id }) : undefined
              }
              onRequestViewing={
                canTenantAct && isTenant
                  ? () => requestViewing.mutate({ propertyId: p.id })
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
