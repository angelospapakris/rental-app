import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import type { Property, PropertyType, PagedResponse } from "@/types";
import { getPropertyTypeLabel } from "@/types";
import { toArray } from "@/lib/utils";

export default function PendingProperties() {
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: () => api.get<PagedResponse<Property>>(ENDPOINTS.properties.pendingProps),
  });

  const pending = useMemo(() => toArray<Property>(data as any), [data]);

  const approve = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.properties.approve(id)),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["pending-properties"] });
      const prev = qc.getQueryData<any>(["pending-properties"]);
      qc.setQueryData(["pending-properties"], (old: any) => {
        if (!old) return old;
        const clone = structuredClone(old);
        const arr: Property[] = toArray<Property>(clone);
        const filtered = arr.filter((p) => p.id !== id);
        if (Array.isArray((clone as any)?.data?.data)) (clone as any).data.data = filtered;
        else if (Array.isArray((clone as any)?.data?.content)) (clone as any).data.content = filtered;
        else if (Array.isArray(clone)) return filtered;
        else (clone as any).data = filtered;
        return clone;
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["pending-properties"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["pending-properties"] }),
  });

  const reject = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.properties.reject(id)),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["pending-properties"] });
      const prev = qc.getQueryData<any>(["pending-properties"]);
      qc.setQueryData(["pending-properties"], (old: any) => {
        if (!old) return old;
        const clone = structuredClone(old);
        const arr: Property[] = toArray<Property>(clone);
        const filtered = arr.filter((p) => p.id !== id);
        if (Array.isArray((clone as any)?.data?.data)) (clone as any).data.data = filtered;
        else if (Array.isArray((clone as any)?.data?.content)) (clone as any).data.content = filtered;
        else if (Array.isArray(clone)) return filtered;
        else (clone as any).data = filtered;
        return clone;
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["pending-properties"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["pending-properties"] }),
  });

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="p-4 rounded-2xl border">
          <p className="font-semibold">Ωχ! Κάτι πήγε στραβά.</p>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.message ?? "Αποτυχία φόρτωσης δεδομένων."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Εκκρεμείς καταχωρίσεις</h1>

      {pending.length === 0 ? (
        <div className="text-muted-foreground">Δεν υπάρχουν εκκρεμείς καταχωρίσεις.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pending.map((p) => {
            const title = p.title || (p as any).name || "Ακίνητο";
            const city = (p as any).city ?? (p as any).location;
            const addr = (p as any).address;
            const size = (p as any).size;
            const beds = (p as any).bedrooms;
            const baths = (p as any).bathrooms;
            const type = (p as any).type as PropertyType | undefined;
            const price = (p as any).price;
            const ownerEmail = (p as any).ownerEmail;

            return (
              <div key={p.id} className="p-4 border rounded-2xl space-y-3">
                {/* TOP: Title (left) + Actions (right) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="font-medium text-base truncate">{title}</div>

                    {/* DESCRIPTION directly under the title */}
                    {p.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {p.description}
                      </p>
                    )}

                    {/* META row */}
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                      {city && <span>{city}</span>}
                      {addr && <span>• {addr}</span>}
                      {isNumber(size) && <span>• {size} m²</span>}
                      {isNumber(beds) && <span>• {beds} υπνοδωμ.</span>}
                      {isNumber(baths) && <span>• {baths} μπάν.</span>}
                      {type && <span>• {getPropertyTypeLabel(type)}</span>}
                      {ownerEmail && <span>• {ownerEmail}</span>}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="shrink-0 flex gap-2">
                    <Button
                      onClick={() => approve.mutate(p.id)}
                      disabled={approve.isPending || reject.isPending}
                    >
                      {approve.isPending ? "Έγκριση..." : "Έγκριση"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => reject.mutate(p.id)}
                      disabled={approve.isPending || reject.isPending}
                    >
                      {reject.isPending ? "Απόρριψη..." : "Απόρριψη"}
                    </Button>
                  </div>
                </div>

                {/* PRICE */}
                {notEmpty(price) && (
                  <div className="flex justify-start">
                    <div className="rounded-full px-2 py-1 text-sm bg-muted">
                      {formatPrice(price)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */
function isNumber(v: any): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}
function notEmpty(v: any) {
  return v !== null && v !== undefined && v !== "";
}
function formatPrice(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? `${n}€` : `${v}€`;
}
