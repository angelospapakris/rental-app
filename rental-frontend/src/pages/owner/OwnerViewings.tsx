import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";

export default function OwnerViewings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["owner-viewings"],
    queryFn: () => api.get<any[]>(ENDPOINTS.viewings.ownerList),
  });

  const confirm = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.viewings.confirm(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-viewings"] }),
  });
  const decline = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.viewings.decline(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-viewings"] }),
  });
  const complete = useMutation({
    mutationFn: (id: number) => api.post(ENDPOINTS.viewings.complete(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-viewings"] }),
  });

  if (isLoading) return <Loading/>;
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Αιτήματα προβολών</h1>
      {data?.map((v)=>(
        <div key={v.id} className="p-4 border rounded-2xl flex items-center justify-between">
          <div>
            <div className="font-medium">#{v.id} — {v.propertyTitle}</div>
            <div className="text-sm text-muted-foreground">{v.status}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={()=>confirm.mutate(v.id)}>Επιβεβαίωση</Button>
            <Button variant="outline" onClick={()=>decline.mutate(v.id)}>Απόρριψη</Button>
            <Button variant="secondary" onClick={()=>complete.mutate(v.id)}>Ολοκληρώθηκε</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
