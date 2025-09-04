// src/pages/Home.tsx (μόνο τα επιπλέον κομμάτια)

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

// local flags
const appliedKey = (userId?: string | null, propertyId?: string | number) =>
  userId && propertyId != null ? `applied:${userId}:${propertyId}` : null;
const hasAppliedLocal = (userId?: string | null, propertyId?: string | number) => {
  const k = appliedKey(userId, propertyId);
  return k ? localStorage.getItem(k) === "true" : false;
};
const viewKey = (userId?: string | null, propertyId?: string | number) =>
  userId && propertyId != null ? `viewreq:${userId}:${propertyId}` : null;
const hasViewingLocal = (userId?: string | null, propertyId?: string | number) => {
  const k = viewKey(userId, propertyId);
  return k ? localStorage.getItem(k) === "true" : false;
};

export default function Home() {
  const { hasRole, user } = useAuth();

  // blocked από localStorage (γράφεται στα submit pages στο unverified)
  const storageKey = user?.usernameOrEmail ? `blocked:${user.usernameOrEmail}` : null;
  const getBlocked = () => (storageKey ? localStorage.getItem(storageKey) === "true" : false);

  const isTenant = hasRole("TENANT");
  const tenantBlocked = isTenant ? getBlocked() : false;

  // 1) Δημόσια properties
  const propsQ = useQuery({
    queryKey: ["public-properties"],
    queryFn: () => api.get<PagedResponse<Property> | Property[]>(ENDPOINTS.properties.publicProps),
    select: (res) => toArray<Property>(res),
  });

  // 2) Δικές μου αιτήσεις (για γκριζάρισμα "Αίτηση ενοικίασης")
  type AppItem = { id: number; propertyId?: number; property?: { id?: number } };
  const myAppsQ = useQuery({
    queryKey: ["my-applications-mini"],
    enabled: isTenant && !!ENDPOINTS.applications?.tenantApps,
    queryFn: () => api.get<any>(ENDPOINTS.applications.tenantApps),
    select: (res) => toArray<AppItem>(res),
    staleTime: 60_000,
  });
  const appliedSet = useMemo(() => {
    const s = new Set<number | string>();
    (myAppsQ.data ?? []).forEach((a) => {
      const pid = typeof a.propertyId === "number" ? a.propertyId : a.property?.id;
      if (pid != null) s.add(pid);
    });
    return s;
  }, [myAppsQ.data]);

  // 3) Δικά μου viewing requests (για γκριζάρισμα "Αίτημα προβολής")
  type ViewItem = { id: number; propertyId?: number; property?: { id?: number } };
  const myViewingsQ = useQuery({
    queryKey: ["my-viewings-mini"],
    enabled: isTenant && !!ENDPOINTS.viewings?.tenantViews,
    queryFn: () => api.get<any>(ENDPOINTS.viewings.tenantViews),
    select: (res) => toArray<ViewItem>(res),
    staleTime: 60_000,
  });
  const viewingSet = useMemo(() => {
    const s = new Set<number | string>();
    (myViewingsQ.data ?? []).forEach((v) => {
      const pid = typeof v.propertyId === "number" ? v.propertyId : v.property?.id;
      if (pid != null) s.add(pid);
    });
    return s;
  }, [myViewingsQ.data]);

  if (propsQ.isLoading) return <Loading />;
  if (propsQ.error) return <p className="p-6 text-red-600">{(propsQ.error as Error).message}</p>;

  const list = propsQ.data ?? [];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Διαθέσιμα ακίνητα</h1>
          {isTenant && tenantBlocked && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
              <span className="font-medium">Μη επαληθευμένος χρήστης</span>
            </div>
          )}
        </div>

        {hasRole("OWNER") && (
          <Button asChild>
            <Link to="/createProps">+ Νέα καταχώριση</Link>
          </Button>
        )}
      </div>

      {/* Λίστα */}
      {list.length === 0 ? (
        <p className="text-muted-foreground">Δεν βρέθηκαν ακίνητα.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((p) => {
            const alreadyApplied =
              isTenant &&
              (appliedSet.has(p.id) || hasAppliedLocal(user?.usernameOrEmail, p.id));

            const alreadyViewing =
              isTenant &&
              (viewingSet.has(p.id) || hasViewingLocal(user?.usernameOrEmail, p.id));

            const applyDisabled = isTenant && (tenantBlocked || alreadyApplied);
            const applyReason =
              tenantBlocked
                ? "Ο λογαριασμός δεν είναι επαληθευμένος."
                : alreadyApplied
                ? "Έχετε ήδη υποβάλει αίτηση για αυτό το ακίνητο."
                : undefined;

            const viewingDisabled = isTenant && (tenantBlocked || alreadyViewing);
            const viewingReason =
              tenantBlocked
                ? "Ο λογαριασμός δεν είναι επαληθευμένος."
                : alreadyViewing
                ? "Έχετε ήδη υποβάλει αίτημα προβολής για αυτό το ακίνητο."
                : undefined;

            return (
              <PropertyCard
                key={p.id}
                property={p}
                showApply={isTenant}
                showViewing={isTenant}
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
