// src/pages/tenant/NewApplication.tsx
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

type Form = { message: string };

// helpers για errors
const looksLikeUnverified = (e: any) => {
  const msg = String(e?.response?.data?.message ?? e?.message ?? "");
  const status = Number(e?.response?.status ?? e?.status ?? e?.code ?? 0);
  return /must\s*be\s*verified/i.test(msg) || /verify/i.test(msg) || [400, 403, 500].includes(status);
};
const looksAlreadyExists = (e: any) => {
  const status = Number(e?.response?.status ?? e?.status ?? e?.code ?? 0);
  const msg = String(e?.response?.data?.message ?? e?.message ?? "");
  const code = String(e?.response?.data?.error ?? "");
  return status === 409 || /already[_\s-]?exists|conflict/i.test(msg) || /already[_\s-]?exists|conflict/i.test(code);
};

export const setBlockedForUser = (usernameOrEmail?: string | null, val?: boolean) => {
  const k = storageKeyForUser(usernameOrEmail);
  if (k) localStorage.setItem(k, String(!!val));
};

export default function NewApplication() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const propertyId = params.get("propertyId");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<Form>({ defaultValues: { message: "" }, mode: "onBlur" });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (f: Form) => {
    setMsg(null);
    setErr(null);

    if (!propertyId) {
      setErr("Λείπει το propertyId από το URL.");
      return;
    }

    try {
      // propertyId μπαίνει στο URL με builder
      await api.post(
        ENDPOINTS.applications.submitApp(propertyId),
        { message: f.message }
      );

      setMsg("Η αίτηση υποβλήθηκε με επιτυχία και αναμένεται επεξεργασία.");
      reset({ message: "" });
      setTimeout(() => nav("/applications"), 900);
    } catch (e) {
      const errAny = e as any;

      // 409: υπάρχει ήδη αίτηση
      if (looksAlreadyExists(errAny)) {
        setErr("Έχετε ήδη υποβάλει αίτηση για αυτό το ακίνητο.");
        return;
      }

      // Unverified: κλείδωσε UI σε επόμενα βήματα
      if (looksLikeUnverified(errAny)) {
        // αν έχεις διαθέσιμο username/email εδώ, πέρασέ το
        setBlockedForUser(localStorage.getItem("username") ?? null, true);
        setErr("Ο λογαριασμός δεν είναι επαληθευμένος από διαχειριστή.");
        return;
      }

      // Field/server errors
      const data = errAny?.response?.data;
      const message = data?.message || errAny?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      const fieldErrors: Record<string, string> =
        data?.errors || data?.fieldErrors || data?.violations || {};
      if (fieldErrors && typeof fieldErrors === "object") {
        let hasField = false;
        Object.entries(fieldErrors).forEach(([name, m]) => {
          if (name === "message") {
            hasField = true;
            setError("message", { type: "server", message: String(m) });
          }
        });
        if (!hasField) setErr(message);
      } else {
        setErr(message);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Νέα αίτηση</h1>

      {!propertyId && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          Δεν εντοπίστηκε ακίνητο. Ανοίξτε την αίτηση από την κάρτα ακινήτου.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="message">Μήνυμα</Label>
          <Textarea
            id="message"
            rows={6}
            placeholder="Γράψτε το μήνυμά σας…"
            {...register("message", {
              required: "Το μήνυμα είναι υποχρεωτικό",
              minLength: { value: 10, message: "Ελάχιστο 10 χαρακτήρες" },
              maxLength: { value: 2000, message: "Μέγιστο 2000 χαρακτήρες" },
            })}
          />
          {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
        </div>

        {msg && <p className="text-green-700">{msg}</p>}
        {err && <p className="text-red-700">{err}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || !propertyId}>
            {isSubmitting ? "Αποστολή..." : "Αποστολή"}
          </Button>
          <Button type="button" variant="outline" onClick={() => nav(-1)}>
            Πίσω
          </Button>
        </div>
      </form>
    </div>
  );
}
