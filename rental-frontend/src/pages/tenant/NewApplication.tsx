import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { looksLikeUnverified, clearBlockedForUser, setBlockedForUser, looksAlreadyExists, markAppliedLocal, getBlockedForUser }
from "@/lib/verification";

type Form = { message: string };

export default function NewApplication() {
  const { user } = useAuth();
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

  const isBlocked = getBlockedForUser(user?.usernameOrEmail);

  const onSubmit = async (f: Form) => {
    setMsg(null);
    setErr(null);

    if (!propertyId) {
      setErr("Λείπει το propertyId από το URL.");
      return;
    }

    try {
      // PropertyId
      await api.post(ENDPOINTS.applications.submitApp(propertyId), { message: f.message });

      // Success
      clearBlockedForUser(user?.usernameOrEmail);
      markAppliedLocal(user?.usernameOrEmail, propertyId);

      setMsg("Η αίτηση υποβλήθηκε με επιτυχία και αναμένεται επεξεργασία.");
      reset({ message: "" });
      setTimeout(() => nav("/"), 900);
    } catch (e) {
      const errAny = e as any;

      // 409
      if (looksAlreadyExists(errAny)) {
        markAppliedLocal(user?.usernameOrEmail, propertyId!);
        setErr("Έχετε ήδη υποβάλει αίτηση για αυτό το ακίνητο.");
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

      {isBlocked && (
             <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
               <span className="font-medium">Μη επαληθευμένος χρήστης</span>
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
              maxLength: { value: 2000, message: "Μέγιστο 2000 χαρακτήρες" },
            })}
          />
          {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
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