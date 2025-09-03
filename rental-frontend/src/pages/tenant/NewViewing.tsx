import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";

export type ViewingRequestCreateForm = {
  notes: string;
};

export default function NewViewingRequest() {
  const [params] = useSearchParams();
  const propertyId = useMemo(() => params.get("propertyId") ?? undefined, [params]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ViewingRequestCreateForm>({
    defaultValues: {
      notes: "",
      propertyId,
    },
    mode: "onBlur",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (f: ViewingRequestCreateForm) => {
    setMsg(null);
    setErr(null);

    try {
      await api.post(ENDPOINTS.viewings.requestViews, f);

      setMsg("Το αίτημα προβολής υποβλήθηκε και αναμένεται επιβεβαίωση.");
      reset({ notes: "", propertyId });
      setTimeout(() => nav("/viewings"), 900);
    } catch (e: any) {
      const data = e?.response?.data;
      const message = data?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      const fieldErrors: Record<string, string> =
        data?.errors || data?.fieldErrors || data?.violations || {};

      if (fieldErrors && typeof fieldErrors === "object") {
        let hasField = false;
        Object.entries(fieldErrors).forEach(([name, m]) => {
          if (name in ({} as ViewingRequestCreateForm)) {
            hasField = true;
            setError(name as keyof ViewingRequestCreateForm, {
              type: "server",
              message: String(m),
            });
          }
        });
        if (!hasField) setErr(message);
      } else {
        setErr(message);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Νέο αίτημα προβολής</h1>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {propertyId && (
          <input type="hidden" {...register("propertyId")} value={propertyId} />
        )}

        <div>
          <Label htmlFor="notes">Σημειώσεις</Label>
          <Textarea
            id="notes"
            rows={6}
            placeholder="Π.χ. διαθέσιμες ώρες, ερωτήσεις για το ακίνητο…"
            {...register("notes", {
              required: "Οι σημειώσεις είναι υποχρεωτικές",
              maxLength: { value: 2000, message: "Μέγιστο 2000 χαρακτήρες" },
            })}
          />
          {errors.notes && (
            <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
          )}
        </div>

        {msg && <p className="text-green-700">{msg}</p>}
        {err && <p className="text-red-700">{err}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Αποστολή..." : "Αποστολή"}
          </Button>
        </div>
      </form>
    </div>
  );
}
