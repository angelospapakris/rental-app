import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";

export default function MyViewings() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-viewings"],
    queryFn: () => api.get<any[]>(ENDPOINTS.viewings.my),
  });
  if (isLoading) return <Loading/>;
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Οι προβολές μου</h1>
      {data?.map((v)=>(
        <div key={v.id} className="p-4 border rounded-2xl">
          <div className="font-medium">#{v.id} — {v.propertyTitle}</div>
          <div className="text-sm text-muted-foreground">{v.status}</div>
        </div>
      ))}
    </div>
  );
}
