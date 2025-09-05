import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { getBlockedForUser, clearBlockedForUser, setBlockedForUser, looksAlreadyExists, markViewingLocal, looksLikeUnverified}
from "@/lib/verification";

type ViewingRequestCreateForm = { notes: string };

export default function NewViewing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const propertyId = params.get("propertyId");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ViewingRequestCreateForm>({
    defaultValues: { notes: "" },
    mode: "onBlur",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isBlocked = getBlockedForUser(user?.usernameOrEmail);

  const onSubmit = async (f: ViewingRequestCreateForm) => {
    setMsg(null);
    setErr(null);

    if (!propertyId) {
      setErr("Λείπει το propertyId από το URL.");
      return;
    }

    if (isBlocked) {
      setErr("Ο λογαριασμός δεν είναι επαληθευμένος από διαχειριστή.");
      return;
    }

    try {
         // PropertyId
         await api.post(ENDPOINTS.viewings.requestViews(propertyId), { notes: f.notes });

      // Success
      clearBlockedForUser(user?.usernameOrEmail);
      markViewingLocal(user?.usernameOrEmail, propertyId);

      setMsg("Το αίτημα προβολής υποβλήθηκε και αναμένεται επιβεβαίωση.");
      reset({ notes: "" });
      setTimeout(() => nav("/"), 900);
    } catch (e) {
      const errAny: any = e;

      // 409
      if (looksAlreadyExists(errAny)) {
        markViewingLocal(user?.usernameOrEmail, propertyId!);
        setErr("Έχετε ήδη υποβάλει αίτημα προβολής για αυτό το ακίνητο.");
        return;
      }

      // Unverified
      if (looksLikeUnverified(errAny)) {
        setBlockedForUser(user?.usernameOrEmail, true);
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
          if (name === "notes") {
            hasField = true;
            setError("notes", { type: "server", message: String(m) });
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

      {!propertyId && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          Δεν εντοπίστηκε ακίνητο. Ανοίξτε το αίτημα από την κάρτα ακινήτου.
        </div>
      )}

      {isBlocked && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
          <span className="font-medium">Μη επαληθευμένος χρήστης</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          <Button type="submit" disabled={isSubmitting || !propertyId || isBlocked}>
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