import { useState } from "react";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

export default function Users() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>(`${ENDPOINTS.adminUsers.searchUsers}?q=${encodeURIComponent(q)}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (id: number) => {
    await api.post(ENDPOINTS.adminUsers.verify(id));
    await search();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Διαχείριση χρηστών</h1>

      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 w-full" placeholder="Αναζήτηση…" value={q} onChange={e=>setQ(e.target.value)} />
        <Button onClick={search}>Αναζήτηση</Button>
      </div>

      {loading && <Loading/>}

      {data?.map((u)=>(
        <div key={u.id} className="p-4 border rounded-2xl flex items-center justify-between">
          <div>
            <div className="font-medium">{u.email}</div>
            <div className="text-sm text-muted-foreground">roles: {(u.roles||[]).join(", ")}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={()=>verify(u.id)}>Επαλήθευση</Button>
            <Button variant="outline" onClick={()=>api.post(ENDPOINTS.adminUsers.activate(u.id))}>Ενεργοποίηση</Button>
            <Button variant="destructive" onClick={()=>api.post(ENDPOINTS.adminUsers.deactivate(u.id))}>Απενεργοποίηση</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
