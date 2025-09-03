import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export type ApplicationCreateForm = {
  message: string;
};

export default function NewApplication() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationCreateForm>({
    defaultValues: {
      message: "",
    },
    mode: "onBlur",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (f: ApplicationCreateForm) => {
    setMsg(null);
    setErr(null);

    try {
      await api.post(ENDPOINTS.applications.submitApps, f);

      setMsg("Η αίτηση υποβλήθηκε με επιτυχία και αναμένεται επεξεργασία.");
      reset({ message: "" });
      setTimeout(() => nav("/applications"), 900);
    } catch (e: any) {
      const data = e?.response?.data;
      const message = data?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      const fieldErrors: Record<string, string> =
        data?.errors || data?.fieldErrors || data?.violations || {};

      if (fieldErrors && typeof fieldErrors === "object") {
        let hasField = false;
        Object.entries(fieldErrors).forEach(([name, m]) => {
          if (name in ({} as ApplicationCreateForm)) {
            hasField = true;
            setError(name as keyof ApplicationCreateForm, { type: "server", message: String(m) });
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
      <h1 className="text-2xl font-semibold mb-4">Νέα αίτηση</h1>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="message">Μήνυμα</Label>
          <Textarea
            id="message"
            rows={6}
            placeholder="Γράψτε το μήνυμά σας προς τον ιδιοκτήτη…"
            {...register("message", {
              required: "Το μήνυμα είναι υποχρεωτικό",
              maxLength: { value: 2000, message: "Μέγιστο 2000 χαρακτήρες" },
            })}
          />
          {errors.message && (
            <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
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
