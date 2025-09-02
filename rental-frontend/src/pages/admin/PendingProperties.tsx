import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

export default function PendingProperties() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: () => api.get<any[]>(ENDPOINTS.properties.pending),
  });

  const approve = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.properties.approve(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-properties"] }),
  });
  const reject = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.properties.reject(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-properties"] }),
  });

  if (isLoading) return <Loading/>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Εκκρεμείς καταχωρίσεις</h1>
      {data?.map((p)=>(
        <div key={p.id} className="p-4 border rounded-2xl flex items-center justify-between">
          <div>
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-muted-foreground">{p.ownerEmail}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={()=>approve.mutate(p.id)}>Έγκριση</Button>
            <Button variant="outline" onClick={()=>reject.mutate(p.id)}>Απόρριψη</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
