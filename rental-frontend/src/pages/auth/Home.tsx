import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import PropertyCard from "@/components/PropertyCard";
import Loading from "@/components/Loading";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function Home() {
  const qc = useQueryClient();
  const { hasRole } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-properties"],
    queryFn: () => api.get<any[]>(ENDPOINTS.properties.public),
  });

  const apply = useMutation({
    mutationFn: (payload: any) => api.post(ENDPOINTS.applications.submit, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] }),
  });

  const requestViewing = useMutation({
    mutationFn: (payload: any) => api.post(ENDPOINTS.viewings.request, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-viewings"] }),
  });

  if (isLoading) return <Loading/>;
  if (error) return <p className="p-6 text-red-600">{(error as Error).message}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Διαθέσιμα ακίνητα</h1>
        {hasRole("OWNER") && (
          <Button asChild><a href="/owner/new">+ Νέα καταχώριση</a></Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {data?.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            onApply={hasRole("TENANT") ? () => apply.mutate({ propertyId: p.id }) : undefined}
            onRequestViewing={hasRole("TENANT") ? () => requestViewing.mutate({ propertyId: p.id }) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
