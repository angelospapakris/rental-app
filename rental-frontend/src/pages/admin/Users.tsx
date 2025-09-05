import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { toArray } from "@/lib/utils";
import { RoleOptions, RoleLabel } from "@/types";
import type { AdminUser, BoolFilter } from "@/types";

const DISABLED_GRAY =
  "bg-gray-200 text-gray-500 border border-gray-300 pointer-events-none opacity-100";

export default function Users() {
  const [role, setRole] = useState<string>("");
  const [verified, setVerified] = useState<BoolFilter>("");
  const [active, setActive] = useState<BoolFilter>("");
  const [data, setData] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (verified) params.set("verified", verified);
    if (active) params.set("active", active);
    const qs = params.toString();
    return qs
      ? `${ENDPOINTS.adminUsers.searchUsers}?${qs}`
      : ENDPOINTS.adminUsers.searchUsers;
  };

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = buildQuery();
      const res = await api.get<any>(url);
      const rows = toArray<AdminUser>(res).filter(
        (u) => !((u.roles ?? []).includes("ADMIN"))
      );
      setData(rows);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Αποτυχία αναζήτησης.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withRefresh = (fn: () => Promise<any>) => async () => {
    try {
      await fn();
    } finally {
      await search();
    }
  };

  const verify = async (id: number) => {
    setBusyId(id);
    try {
      await api.post(ENDPOINTS.adminUsers.verify(id));
    } finally {
      setBusyId(null);
    }
  };

  const activate = async (id: number) => {
    setBusyId(id);
    try {
      await api.post(ENDPOINTS.adminUsers.activate(id));
    } finally {
      setBusyId(null);
    }
  };

  const deactivate = async (id: number) => {
    setBusyId(id);
    try {
      await api.post(ENDPOINTS.adminUsers.deactivate(id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Διαχείριση χρηστών</h1>

      {/* Φίλτρα */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <select
          className="border rounded px-3 py-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {RoleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2 w-full"
          value={verified}
          onChange={(e) => setVerified(e.target.value as BoolFilter)}
        >
          <option value="">Επαλήθευση: Όλοι</option>
          <option value="true">Μόνο επαληθευμένοι</option>
          <option value="false">Μόνο μη επαληθευμένοι</option>
        </select>

        <select
          className="border rounded px-3 py-2 w-full"
          value={active}
          onChange={(e) => setActive(e.target.value as BoolFilter)}
        >
          <option value="">Κατάσταση: Όλοι</option>
          <option value="true">Μόνο ενεργοί</option>
          <option value="false">Μόνο ανενεργοί</option>
        </select>

        <Button onClick={search}>Αναζήτηση</Button>
      </div>

      {loading && <Loading />}

      {error && (
        <div className="p-3 border rounded text-sm text-red-600 bg-red-50">
          {error}
        </div>
      )}

      {!loading && !error && (data?.length ?? 0) === 0 && (
        <div className="text-sm text-muted-foreground">Δεν βρέθηκαν χρήστες.</div>
      )}

      {data?.map((u) => {
        const fullName = [u.firstname, u.lastname].filter(Boolean).join(" ").trim();
        const roles = u.roles ?? [];
        const rolesEl =
          roles.filter((r) => r !== "ADMIN").map((r) => RoleLabel[r] ?? r).join(", ") || "—";

        const isBusy = busyId === u.id;
        const isTenant = roles.includes("TENANT");

        // Disabled rules
        const verifyDisabled = isBusy || u.verified === true; // disabled όταν είναι ήδη verified
        const activateDisabled = isBusy || u.active === true; // disabled όταν είναι ήδη active
        const deactivateDisabled = isBusy || u.active === false; // disabled όταν είναι ήδη inactive

        return (
          <div
            key={u.id}
            className="p-4 border rounded-2xl flex items-center justify-between"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{u.email}</div>
              {fullName && <div className="text-sm">{fullName}</div>}
              <div className="text-sm text-muted-foreground">
                Ρόλος: {rolesEl}
                {u.verified !== undefined && (
                  <span> • {u.verified ? "Επαληθευμένος" : "Μη επαληθευμένος"}</span>
                )}
                {u.active !== undefined && (
                  <span> • {u.active ? "Ενεργός" : "Ανενεργός"}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* Επαλήθευση — ΜΟΝΟ για TENANT */}
              {isTenant && (
                <Button
                  disabled={verifyDisabled}
                  aria-disabled={verifyDisabled}
                  tabIndex={verifyDisabled ? -1 : 0}
                  className={verifyDisabled ? DISABLED_GRAY : ""}
                  onClick={withRefresh(() => verify(u.id))}
                >
                  {isBusy ? "Επαλήθευση..." : "Επαλήθευση"}
                </Button>
              )}

              {/* Ενεργοποίηση */}
              <Button
                disabled={activateDisabled}
                aria-disabled={activateDisabled}
                tabIndex={activateDisabled ? -1 : 0}
                className={
                  activateDisabled
                    ? DISABLED_GRAY
                    : "bg-green-600 hover:bg-green-700 text-white border-green-700"
                }
                onClick={withRefresh(() => activate(u.id))}
              >
                {isBusy ? "Ενεργοποίηση..." : "Ενεργοποίηση"}
              </Button>

              {/* Απενεργοποίηση */}
              <Button
                disabled={deactivateDisabled}
                aria-disabled={deactivateDisabled}
                tabIndex={deactivateDisabled ? -1 : 0}
                className={
                  deactivateDisabled
                    ? DISABLED_GRAY
                    : "bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
                }
                onClick={withRefresh(() => deactivate(u.id))}
              >
                {isBusy ? "Απενεργοποίηση..." : "Απενεργοποίηση"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
