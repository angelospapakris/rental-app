import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import PropertyCard from "@/components/PropertyCard";
import Loading from "@/components/Loading";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import type { Property, PagedResponse } from "@/types";

/* Helpers */
const toArray = <T,>(res: any): T[] =>
  Array.isArray(res) ? res
  : Array.isArray(res?.data) ? res.data
  : Array.isArray(res?.content) ? res.content
  : [];

const looksLikeUnverified = (e: any) => {
  const msg = String(e?.response?.data?.message ?? e?.message ?? "");
  const status = Number(e?.response?.status ?? e?.status ?? e?.code ?? 0);
  return /must\s*be\s*verified/i.test(msg) || /verify/i.test(msg) || [400, 403, 500].includes(status);
};

export default function Home() {
  const { hasRole, user } = useAuth();
  const nav = useNavigate();

  // persist flag per user
  const storageKey = user?.usernameOrEmail ? `blocked:${user.usernameOrEmail}` : null;
  const getBlocked = () => (storageKey ? localStorage.getItem(storageKey) === "true" : false);
  const setBlocked = (val: boolean) => { if (storageKey) localStorage.setItem(storageKey, String(val)); };

  const isTenant = hasRole("TENANT");
  const tenantBlockedLS = isTenant ? getBlocked() : false;

  // 1) Προφόρτωση properties (δημόσια)
  const propsQ = useQuery({
    queryKey: ["public-properties"],
    queryFn: () => api.get<PagedResponse<Property> | Property[]>(ENDPOINTS.properties.publicProps),
    select: (res) => toArray<Property>(res),
  });

  // 2) PRECHECK: ρώτα αν ο tenant είναι verified (μία φορά στο Home)
  //    Βάλε το ΣΩΣΤΟ endpoint αντί για ENDPOINTS.auth.me αν έχεις άλλο (π.χ. ENDPOINTS.account.me)
  const verifyQ = useQuery({
    queryKey: ["tenant-verified-precheck"],
    enabled: isTenant && !tenantBlockedLS, // αν ήδη μπλοκαρισμένος, δεν χρειάζεται check
    queryFn: async () => {
      const me = await api.get<any>(ENDPOINTS.auth.me); // <-- ΑΛΛΑΞΕ εδώ αν χρειάζεται
      // Προσάρμοσε το path: true/false
      const verified =
        Boolean(
          me?.verified ??
          me?.data?.verified ??
          me?.tenant?.verified ??
          me?.profile?.verified
        );
      return verified;
    },
    onSuccess: (verified) => {
      if (!verified) setBlocked(true);
    },
    onError: (e) => {
      if (looksLikeUnverified(e)) setBlocked(true);
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const tenantBlocked = tenantBlockedLS || (verifyQ.data === false);

  // 3) Click handlers: αν είσαι unverified, μην πλοηγείς
  const goToApply = (propertyId: number | string) => {
    if (isTenant && tenantBlocked) return;
    nav(`/applications/new?propertyId=${propertyId}`);
  };
  const goToViewing = (propertyId: number | string) => {
    if (isTenant && tenantBlocked) return;
    nav(`/viewings/new?propertyId=${propertyId}`);
  };

  if (propsQ.isLoading) return <Loading />;
  if (propsQ.error) return <p className="p-6 text-red-600">{(propsQ.error as Error).message}</p>;

  const list = propsQ.data ?? [];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        {/* Αριστερά: Τίτλος + Unverified πλαίσιο */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Διαθέσιμα ακίνητα</h1>

              {isTenant && tenantBlocked && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  <span className="font-medium">Μη επαληθευμένος χρήστης</span>
                </div>
              )}
            </div>

        {/* Δεξιά: κουμπί ιδιοκτήτη */}
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
          {list.map((p) => {
            // αν έχεις Set από /applications/my + optional local cache
            const alreadyApplied =
              isTenant &&
              ((typeof appliedSet !== "undefined" && appliedSet?.has?.(p.id)) ||
                (typeof hasAppliedLocal !== "undefined" && hasAppliedLocal?.(user?.usernameOrEmail, p.id)));

            const applyDisabled = isTenant && (tenantBlocked || alreadyApplied);
            const applyReason = tenantBlocked
              ? "Ο λογαριασμός δεν είναι επαληθευμένος."
              : alreadyApplied
              ? "Έχετε ήδη υποβάλει αίτηση για αυτό το ακίνητο."
              : undefined;

            const viewingDisabled = isTenant && tenantBlocked;
            const viewingReason = viewingDisabled ? "Ο λογαριασμός δεν είναι επαληθευμένος." : undefined;

            return (
              <PropertyCard
                key={p.id}
                property={p}
                /* Κουμπιά μόνο για TENANT */
                showApply={isTenant}
                showViewing={isTenant}
                /* Disabled + μήνυμα */
                applyDisabled={applyDisabled}
                applyReason={applyReason}
                viewingDisabled={viewingDisabled}
                viewingReason={viewingReason}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
