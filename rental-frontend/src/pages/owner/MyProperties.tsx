import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";

export default function MyProperties() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: () => api.get<any[]>(ENDPOINTS.properties.my),
  });

  const update = useMutation({
    mutationFn: (p: any) => api.put(ENDPOINTS.properties.update(p.id), p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-properties"] }),
  });

  if (isLoading) return <Loading/>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Τα ακίνητά μου</h1>
      <div className="space-y-2">
        {data?.map((p) => (
          <div key={p.id} className="p-4 border rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-muted-foreground">{p.status}</div>
            </div>
            <Button
              variant="outline"
              onClick={()=>update.mutate({ ...p, title: p.title })}>
              Αποθήκευση (demo)
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
