import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";

export default function OwnerApplications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["owner-applications"],
    queryFn: () => api.get<any[]>(ENDPOINTS.applications.ownerList),
  });

  const approve = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.applications.approve(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-applications"] }),
  });
  const reject = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.applications.reject(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-applications"] }),
  });

  if (isLoading) return <Loading/>;
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Αιτήσεις για τα ακίνητά μου</h1>
      {data?.map((a)=>(
        <div key={a.id} className="p-4 border rounded-2xl flex items-center justify-between">
          <div>
            <div className="font-medium">#{a.id} — {a.tenantEmail}</div>
            <div className="text-sm text-muted-foreground">{a.status}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={()=>approve.mutate(a.id)}>Έγκριση</Button>
            <Button variant="outline" onClick={()=>reject.mutate(a.id)}>Απόρριψη</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
