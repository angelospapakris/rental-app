import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import PropertyCard from "@/components/PropertyCard";
import Loading from "@/components/Loading";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Property, PagedResponse } from "@/types";

/* Helpers */
const toArray = <T,>(res: any): T[] =>
  Array.isArray(res) ? res
  : Array.isArray(res?.data) ? res.data
  : Array.isArray(res?.content) ? res.content
  : [];

const looksLikeUnverified = (e: any) => {
  const msg = String(e?.message ?? "");
  const code = String(e?.code ?? e?.status ?? "");
  return /access\s*denied/i.test(msg) || /forbidden/i.test(msg) || /verify/i.test(msg) || code === "500";
};

export default function Home() {
  const qc = useQueryClient();
  const { hasRole, user } = useAuth();

  const storageKey = user?.usernameOrEmail ? `blocked:${user.usernameOrEmail}` : null;
  const getBlocked = () => (storageKey ? localStorage.getItem(storageKey) === "true" : false);
  const setBlocked = (val: boolean) => { if (storageKey) localStorage.setItem(storageKey, String(val)); };

  const isTenant = hasRole("TENANT");
  const tenantBlocked = isTenant ? getBlocked() : false;
  const canTenantAct = !isTenant || !tenantBlocked;

  const { data: list = [], isLoading, error } = useQuery({
    queryKey: ["public-properties"],
    queryFn: () => api.get<PagedResponse<Property> | Property[]>(ENDPOINTS.properties.publicProps),
    select: (res) => toArray<Property>(res),
  });

  const onVerifyError = (e: any) => {
    if (looksLikeUnverified(e)) {
      setBlocked(true);
      alert("Ο λογαριασμός δεν είναι επαληθευμένος από διαχειριστή.");
    }
  };

  const apply = useMutation({
    mutationFn: (payload: any) => api.post(ENDPOINTS.applications.submitApps, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
    onError: onVerifyError,
  });

  const requestViewing = useMutation({
    mutationFn: (payload: any) => api.post(ENDPOINTS.viewings.requestViews, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-viewings"] }),
    onError: onVerifyError,
  });

  if (isLoading) return <Loading />;
  if (error) return <p className="p-6 text-red-600">{(error as Error).message}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-semibold">Διαθέσιμα ακίνητα</h1>

        {isTenant && tenantBlocked && (
          <span className="text-sm px-3 py-1 rounded-xl border border-red-500 text-red-700 bg-red-50">
            Unverified
          </span>
        )}

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
              onApply={
                canTenantAct && isTenant
                  ? () => apply.mutate({ propertyId: p.id })
                  : undefined
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
