import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";

export default function MyApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => api.get<any[]>(ENDPOINTS.applications.my),
  });
  if (isLoading) return <Loading/>;
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Οι αιτήσεις μου</h1>
      {data?.map((a)=>(
        <div key={a.id} className="p-4 border rounded-2xl">
          <div className="font-medium">#{a.id} — {a.propertyTitle}</div>
          <div className="text-sm text-muted-foreground">{a.status}</div>
        </div>
      ))}
    </div>
  );
}
