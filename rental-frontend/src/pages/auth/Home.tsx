import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import PropertyCard from "@/components/PropertyCard";
import Loading from "@/components/Loading";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import type { Property, PagedResponse } from "@/types";
import houseImg from "@/assets/house.png";
import { getBlockedForUser, clearBlockedForUser } from "@/lib/verification";
import { toArray } from "@/lib/utils";

/* ---------- Normalize ---------- */
type PagedMode = "backend-meta" | "array-local";

function normalizePaged<T>(
  res: PagedResponse<T> | T[] | any,
  page: number,
  size: number
): { items: T[]; totalPages: number; totalItems: number; mode: PagedMode } {
  if (res && (Array.isArray(res?.content) || Array.isArray(res?.data?.content))) {
    const content = Array.isArray(res.content) ? res.content : res.data.content;
    const totalPages =
      Number(res?.totalPages ?? res?.data?.totalPages ?? res?.total_pages ?? res?.data?.total_pages) || 0;
    const totalItems =
      Number(
        res?.totalElements ??
          res?.data?.totalElements ??
          res?.total_items ??
          res?.data?.total_items ??
          content.length
      );
    return { items: content as T[], totalPages, totalItems, mode: "backend-meta" };
  }

  const full = Array.isArray(res)
    ? (res as T[])
    : Array.isArray(res?.data)
    ? (res.data as T[])
    : Array.isArray(res?.content)
    ? (res.content as T[])
    : toArray<T>(res);

  const totalItems = full.length;
  if (!totalItems) return { items: [], totalPages: 1, totalItems: 0, mode: "array-local" };

  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const from = Math.max(0, page * size);
  const to = Math.min(totalItems, from + size);
  return { items: full.slice(from, to), totalPages, totalItems, mode: "array-local" };
}



/* ---------- Defaults ---------- */
const DEFAULT_FILTERS = { city: null as string | null, range: [0, 2000] as [number, number] };

export default function Home() {
  const { hasRole, user } = useAuth();

  // state
  const [page, setPage] = useState(0);
  const size = 6;

  // filters (TENANT only)
  const [filters, setFilters] = useState<{ city: string | null; range: [number, number] }>({
    ...DEFAULT_FILTERS,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [draftCity, setDraftCity] = useState<string | null>(DEFAULT_FILTERS.city);
  const [draftRange, setDraftRange] = useState<[number, number]>(DEFAULT_FILTERS.range);

  const isTenant = hasRole("TENANT");
  const tenantBlocked = isTenant ? getBlockedForUser(user?.usernameOrEmail) : false;

  useEffect(() => {
    if (user?.usernameOrEmail) {
      clearBlockedForUser(user.usernameOrEmail);
    }
  }, [user?.usernameOrEmail]);

  const cityKey = filters.city?.trim() ?? null;

  // Properties
  const propsQ = useQuery({
    queryKey: ["public-properties", cityKey, filters.range[0], filters.range[1]],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.city) params.set("city", filters.city.trim());
      params.set("minPrice", String(filters.range[0]));
      params.set("maxPrice", String(filters.range[1]));

      const url = `${ENDPOINTS.properties.publicProps}?${params.toString()}`;
      if (import.meta.env.DEV) console.debug("[propsQ] GET", url);
      return api.get(url, { headers: { "Cache-Control": "no-cache" } });
    },
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const citiesQ = useQuery({
    queryKey: ["cities-from-properties"],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", "0");
      params.set("size", "1000");
      const url = `${ENDPOINTS.properties.publicProps}?${params.toString()}`;
      return api.get<PagedResponse<Property> | Property[] | any>(url);
    },
    select: (res) => {
      const all = toArray<Property>(res);
      const set = new Set<string>();
      all.forEach((p) => p?.city && set.add(String(p.city).trim()));
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },
    staleTime: 5 * 60_000,
  });

  type AppItem = { id: number; propertyId?: number; property?: { id?: number } };
  const myAppsQ = useQuery({
    queryKey: ["my-applications-mini"],
    enabled: !!ENDPOINTS.applications?.tenantApps && isTenant,
    queryFn: () => api.get<any>(ENDPOINTS.applications.tenantApps),
    select: (res) => toArray<AppItem>(res),
    staleTime: 60_000,
  });

  type ViewItem = { id: number; propertyId?: number; property?: { id?: number } };
  const myViewingsQ = useQuery({
    queryKey: ["my-viewings-mini"],
    enabled: !!ENDPOINTS.viewings?.tenantViews && isTenant,
    queryFn: () => api.get<any>(ENDPOINTS.viewings.tenantViews),
    select: (res) => toArray<ViewItem>(res),
    staleTime: 60_000,
  });

  // Effects
  useEffect(() => {
    if (!propsQ.data) return;
    const { totalPages, totalItems, mode } = normalizePaged<Property>(propsQ.data, page, size);

    // Αν δεν έχουμε αξιόπιστα totals (backend-no-meta), μην "μαζεύεις" τη σελίδα.
    if (mode === "backend-no-meta") return;

    const effectiveTotalPages =
      Math.max(Number(totalPages || 0), totalItems ? Math.ceil(totalItems / size) : 0) || 1;

    const maxPage = Math.max(0, effectiveTotalPages - 1);
    if (page > maxPage) setPage(maxPage);
  }, [page, propsQ.data, size]);

  useEffect(() => {
    if (!user) {
      setFilters({ ...DEFAULT_FILTERS });
      setDraftCity(DEFAULT_FILTERS.city);
      setDraftRange(DEFAULT_FILTERS.range);
      setPage(0);
      setSearchOpen(false);
    }
  }, [user]);

  useEffect(() => {
    const reset = () => {
      setFilters({ ...DEFAULT_FILTERS });
      setDraftCity(DEFAULT_FILTERS.city);
      setDraftRange(DEFAULT_FILTERS.range);
      setPage(0);
      setSearchOpen(false);
    };
    window.addEventListener("app:logout", reset);
    return () => window.removeEventListener("app:logout", reset);
  }, []);

  const appliedSet = (() => {
    const s = new Set<number | string>();
    (myAppsQ.data ?? []).forEach((a) => {
      const pid = typeof a.propertyId === "number" ? a.propertyId : a.property?.id;
      if (pid != null) s.add(pid);
    });
    return s;
  })();

  const viewingSet = (() => {
    const s = new Set<number | string>();
    (myViewingsQ.data ?? []).forEach((v) => {
      const pid = typeof v.propertyId === "number" ? v.propertyId : v.property?.id;
      if (pid != null) s.add(pid);
    });
    return s;
  })();

  const hasAppliedLocal = (pid?: string | number) =>
    user?.usernameOrEmail && pid != null
      ? localStorage.getItem(`applied:${user.usernameOrEmail}:${pid}`) === "true"
      : false;

  const hasViewingLocal = (pid?: string | number) =>
    user?.usernameOrEmail && pid != null
      ? localStorage.getItem(`viewreq:${user.usernameOrEmail}:${pid}`) === "true"
      : false;

  // Early returns
  if (propsQ.isLoading) return <Loading />;
  if (propsQ.error) return <p className="p-6 text-red-600">{(propsQ.error as Error).message}</p>;

  const { items: list, totalPages, totalItems, mode } = normalizePaged<Property>(propsQ.data, page, size);

  const effectiveTotalPages =
    mode === "backend-meta"
      ? (Math.max(Number(totalPages || 0), totalItems ? Math.ceil(totalItems / size) : 0) || 1)
      : mode === "array-local"
      ? Math.max(1, Math.ceil(totalItems / size))
      : 0; // backend-no-meta: άγνωστο

  const hasPrev = page > 0;
  const hasNext =
    mode === "backend-no-meta"
      ? list.length === size // αν γυρίζει ακριβώς size, υπάρχει και άλλη σελίδα
      : page + 1 < effectiveTotalPages;

  const cityOptions =
    citiesQ.data?.length && citiesQ.data.length > 0
      ? citiesQ.data
      : Array.from(new Set(list.map((p) => p.city && String(p.city).trim()).filter(Boolean)));

  // Search dialog handlers
  const openSearch = () => {
    setDraftCity(filters.city ?? null);
    setDraftRange([filters.range[0], filters.range[1]]);
    setSearchOpen(true);
  };
  const applySearch = () => {
    let [min, max] = draftRange;
    min = Math.max(0, Math.min(2000, min));
    max = Math.max(min, Math.min(2000, max));
    const city = draftCity ? draftCity.trim() : null;
    setFilters({ city, range: [min, max] });
    setPage(0);
    setSearchOpen(false);
  };
  const clearSearch = () => {
    setDraftCity(null);
    setDraftRange([0, 2000]);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${houseImg})` }}
    >
      <div className="flex-1 bg-white/80 backdrop-blur-sm">
        {/* main */}
        <div className="max-w-6xl mx-auto p-4 space-y-4 pb-20">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Διαθέσιμα ακίνητα</h1>
              {isTenant && tenantBlocked && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  <span className="font-medium">Μη επαληθευμένος χρήστης</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasRole("OWNER") && (
                <Button asChild>
                  <Link to="/createProps">+ Νέα καταχώριση</Link>
                </Button>
              )}
              {isTenant && (
                <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openSearch}>Αναζήτηση</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg" aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Φίλτρα αναζήτησης</DialogTitle>
                      <DialogDescription className="sr-only">
                        Επιλέξτε πόλη και εύρος τιμών για φιλτράρισμα αποτελεσμάτων.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                      <div className="grid gap-2">
                        <Label>Τοποθεσία</Label>
                        <Select
                          value={draftCity ?? "__ALL__"}
                          onValueChange={(v) => setDraftCity(v === "__ALL__" ? null : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε πόλη" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__ALL__">(Όλες)</SelectItem>
                            {cityOptions.map((c) => (
                              <SelectItem key={c} value={String(c)}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Εύρος τιμών (0–2000€)</Label>
                        <Slider
                          min={0}
                          max={2000}
                          step={10}
                          value={draftRange}
                          onValueChange={(val) => setDraftRange([val[0], val[1]] as [number, number])}
                        />
                        <div className="flex items-center gap-3">
                          <div className="grid gap-1">
                            <Label htmlFor="min">Ελάχιστη (€)</Label>
                            <Input
                              id="min"
                              type="number"
                              min={0}
                              max={2000}
                              step={10}
                              value={draftRange[0]}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setDraftRange(([_, hi]) => [Math.min(Math.max(0, v), hi), hi]);
                              }}
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor="max">Μέγιστη (€)</Label>
                            <Input
                              id="max"
                              type="number"
                              min={0}
                              max={2000}
                              step={10}
                              value={draftRange[1]}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setDraftRange(([lo, _]) => [lo, Math.max(lo, Math.min(2000, v))]);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={clearSearch}>
                        Καθαρισμός
                      </Button>
                      <Button onClick={applySearch}>Εφαρμογή</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {list.length === 0 ? (
            <p className="text-muted-foreground">Δεν βρέθηκαν ακίνητα.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {list.map((p) => {
                const alreadyApplied = isTenant && (appliedSet.has(p.id) || hasAppliedLocal(p.id));
                const alreadyViewing = isTenant && (viewingSet.has(p.id) || hasViewingLocal(p.id));

                return (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    showApply={isTenant}
                    showViewing={isTenant}
                    applyDisabled={isTenant && (tenantBlocked || alreadyApplied)}
                    applyReason={
                      tenantBlocked
                        ? "Ο λογαριασμός δεν είναι επαληθευμένος."
                        : alreadyApplied
                        ? "Έχετε ήδη υποβάλει αίτηση."
                        : undefined
                    }
                    viewingDisabled={isTenant && (tenantBlocked || alreadyViewing)}
                    viewingReason={
                      tenantBlocked
                        ? "Ο λογαριασμός δεν είναι επαληθευμένος."
                        : alreadyViewing
                        ? "Έχετε ήδη υποβάλει αίτημα προβολής."
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* fixed footer */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground mr-auto">
            Σελίδα {page + 1}
            {mode !== "backend-no-meta" ? ` από ${effectiveTotalPages}` : ""}{" "}
            {filters.city ? ` • ${filters.city}` : ""} • {filters.range[0]}–{filters.range[1]} €
          </span>
          <Button variant="outline" disabled={!hasPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Προηγούμενη
          </Button>
          <Button variant="outline" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
            Επόμενη
          </Button>
        </div>
      </div>
    </div>
  );
}
