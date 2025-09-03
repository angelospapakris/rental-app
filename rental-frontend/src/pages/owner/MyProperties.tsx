import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import Loading from "@/components/Loading";
import PropertyCard from "@/components/PropertyCard";
import { StatusBadge } from "@/components/StatusBadge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

import type { Property, PropertyType, PagedResponse } from "@/types";

const UpdateSchema = z.object({
  id: z.number(),
  title: z.string().min(5, "Title must be 5–100 characters").max(100),
  description: z.string().min(1, "Description is required").max(2000),
  address: z.string().min(5, "Address must be 5–255 characters").max(255),
  city: z.string().min(2, "City must be 2–100 characters").max(100),
  bedrooms: z.coerce.number().min(0, "Bedrooms must be >= 0"),
  bathrooms: z.coerce.number().min(0, "Bathrooms must be >= 0"),
  size: z.coerce.number().min(1, "Size must be >= 1"),
  price: z.coerce.number().gt(0, "Price must be > 0"),
  type: z.enum(["APARTMENT", "HOUSE", "STUDIO"] as [PropertyType, PropertyType, PropertyType]),
});
type UpdateForm = z.infer<typeof UpdateSchema>;

// Helper
function unwrapPage<T>(res: { data: PagedResponse<T> } | PagedResponse<T> | T[]): T[] {
  const d: any = (res as any)?.data ?? res;
  if (Array.isArray(d)) return d as T[];
  return Array.isArray(d?.data) ? (d.data as T[]) : [];
}

export default function MyProperties() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [editing, setEditing] = useState<Property | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-properties", page, size],
    queryFn: () =>
      api.get<PagedResponse<Property>>(ENDPOINTS.properties.myProps, { params: { page, size } }),
  });

  const properties = useMemo(() => unwrapPage<Property>(data as any), [data]);
  const totalPages = (data as any)?.data?.totalPages ?? 1;

  const update = useMutation({
    mutationFn: (p: UpdateForm) => api.put(ENDPOINTS.properties.updateProps(p.id), p),
    // optimistic update για άμεση αίσθηση
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: ["my-properties"] });
      const prev = qc.getQueryData<any>(["my-properties", page, size]);
      qc.setQueryData(["my-properties", page, size], (old: any) => {
        if (!old) return old;
        const clone = structuredClone(old);
        const arr: Property[] = unwrapPage<Property>(clone);
        const idx = arr.findIndex((x) => x.id === next.id);
        if (idx > -1) {
          arr[idx] = { ...(arr[idx] as Property), ...(next as any) };
          if (clone?.data?.data) clone.data.data = arr;
          else if (Array.isArray(clone)) return arr;
        }
        return clone;
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["my-properties", page, size], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["my-properties"] }),
  });

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="p-4 rounded-2xl border">
          <p className="font-semibold">Ωχ! Κάτι πήγε στραβά.</p>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.message ?? "Αποτυχία φόρτωσης δεδομένων."}
          </p>
        </div>
      </div>
    );
  }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          <h1 className="text-2xl font-semibold">Τα ακίνητά μου</h1>

          {properties.length === 0 ? (
            <div className="text-muted-foreground">Δεν υπάρχουν ακίνητα.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {properties.map((p) => (
                <div key={p.id} className="p-4 border rounded-2xl space-y-3">
                      <div className="relative">
                        <PropertyCard property={p} />
                        <div className="absolute bottom-3 left-3 z-10">
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                  <div className="flex gap-2">
                    <Dialog open={!!editing && editing.id === p.id} onOpenChange={(open) => !open && setEditing(null)}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditing(p)}>Επεξεργασία</Button>
                      </DialogTrigger>
                      {!!editing && editing.id === p.id && (
                        <EditDialog
                          initial={editing}
                          submitting={update.isPending}
                          onCancel={() => setEditing(null)}
                          onSubmit={(vals) => {
                            update.mutate(vals);
                            setEditing(null);
                          }}
                        />
                      )}
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          Προηγούμενη
        </Button>
        <span className="text-sm text-muted-foreground">
          Σελίδα {page + 1} από {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Επόμενη
        </Button>
      </div>
    </div>
  );
}

// ---------- Dialog for Update ----------
function EditDialog({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial: Property;
  onCancel: () => void;
  onSubmit: (values: UpdateForm) => void;
  submitting: boolean;
}) {
  const form = useForm<UpdateForm>({
    resolver: zodResolver(UpdateSchema),
    defaultValues: {
      id: initial.id,
      title: initial.title ?? "",
      description: initial.description ?? "",
      address: initial.address ?? "",
      city: initial.city ?? "",
      bedrooms: initial.bedrooms ?? 0,
      bathrooms: initial.bathrooms ?? 0,
      size: initial.size ?? 1,
      price: initial.price ?? 0,
      type: initial.type ?? "APARTMENT",
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Επεξεργασία ακινήτου</DialogTitle>
      </DialogHeader>

      <form className="space-y-3" onSubmit={handleSubmit((vals) => onSubmit(vals))}>
        <div className="grid gap-3">
          <Field id="title" label="Title" error={errors.title?.message}>
            <Input id="title" {...register("title")} />
          </Field>

          <Field id="description" label="Description" error={errors.description?.message}>
            <Textarea id="description" rows={4} {...register("description")} />
          </Field>

          <Field id="address" label="Address" error={errors.address?.message}>
            <Input id="address" {...register("address")} />
          </Field>

          <Field id="city" label="City" error={errors.city?.message}>
            <Input id="city" {...register("city")} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field id="bedrooms" label="Bedrooms" error={errors.bedrooms?.message}>
              <Input id="bedrooms" type="number" min={0} {...register("bedrooms", { valueAsNumber: true })} />
            </Field>
            <Field id="bathrooms" label="Bathrooms" error={errors.bathrooms?.message}>
              <Input id="bathrooms" type="number" min={0} {...register("bathrooms", { valueAsNumber: true })} />
            </Field>
            <Field id="size" label="Size (m²)" error={errors.size?.message}>
              <Input id="size" type="number" min={1} {...register("size", { valueAsNumber: true })} />
            </Field>
          </div>

          <Field id="price" label="Price (€)" error={errors.price?.message}>
            <Input id="price" type="number" step="0.01" min={0.01} {...register("price", { valueAsNumber: true })} />
          </Field>

          <div className="grid gap-1">
            <Label>Type</Label>
            <Select
              defaultValue={initial.type}
              onValueChange={(v) => setValue("type", v as PropertyType, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="APARTMENT">APARTMENT</SelectItem>
                <SelectItem value="HOUSE">HOUSE</SelectItem>
                <SelectItem value="STUDIO">STUDIO</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Άκυρο</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({
  id, label, error, children,
}: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
