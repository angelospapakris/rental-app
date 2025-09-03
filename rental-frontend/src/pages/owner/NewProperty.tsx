import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { PropertyCreateForm } from "@/types";

export default function NewProperty() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PropertyCreateForm>({
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      bedrooms: 0,
      bathrooms: 0,
      size: 50,
      price: 1,
      type: "APARTMENT",
    },
    mode: "onBlur",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (f: PropertyCreateForm) => {
    setMsg(null);
    setErr(null);

    if (typeof f.price === "number" && f.price <= 0) {
      setError("price", { type: "manual", message: "Η τιμή πρέπει να είναι > 0" });
      return;
    }

    try {
      await api.post(ENDPOINTS.properties.createProps, f);
      setMsg("Η καταχώριση υποβλήθηκε και αναμένεται έγκριση από admin.");
      setTimeout(() => nav("/owner/properties"), 900);
    } catch (e: any) {
      const data = e?.response?.data;
      const message = data?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      const fieldErrors: Record<string, string> =
        data?.errors || data?.fieldErrors || data?.violations || {};

      if (fieldErrors && typeof fieldErrors === "object") {
        let hasField = false;
        Object.entries(fieldErrors).forEach(([name, msg]) => {
          if (name in ({} as PropertyCreateForm)) {
            hasField = true;
            setError(name as keyof PropertyCreateForm, { type: "server", message: String(msg) });
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
      <h1 className="text-2xl font-semibold mb-4">Νέα καταχώριση</h1>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="title">Τίτλος</Label>
          <Input
            id="title"
            {...register("title", {
              required: "Ο τίτλος είναι υποχρεωτικός",
              minLength: { value: 5, message: "Ελάχιστο 5 χαρακτήρες" },
              maxLength: { value: 100, message: "Μέγιστο 100 χαρακτήρες" },
            })}
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Περιγραφή</Label>
          <Textarea
            id="description"
            rows={5}
            {...register("description", {
              required: "Η περιγραφή είναι υποχρεωτική",
              maxLength: { value: 2000, message: "Μέγιστο 2000 χαρακτήρες" },
            })}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Διεύθυνση</Label>
          <Input
            id="address"
            {...register("address", {
              required: "Η διεύθυνση είναι υποχρεωτική",
              minLength: { value: 5, message: "Ελάχιστο 5 χαρακτήρες" },
              maxLength: { value: 255, message: "Μέγιστο 255 χαρακτήρες" },
            })}
          />
          {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
        </div>

        <div>
          <Label htmlFor="city">Πόλη</Label>
          <Input
            id="city"
            {...register("city", {
              required: "Η πόλη είναι υποχρεωτική",
              minLength: { value: 2, message: "Ελάχιστο 2 χαρακτήρες" },
              maxLength: { value: 100, message: "Μέγιστο 100 χαρακτήρες" },
            })}
          />
          {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedrooms">Υπνοδωμάτια</Label>
            <Input
              id="bedrooms"
              type="number"
              min={0}
              step={1}
              {...register("bedrooms", {
                required: "Απαιτείται αριθμός υπνοδωματίων",
                valueAsNumber: true,
                min: { value: 0, message: "Πρέπει να είναι ≥ 0" },
              })}
            />
            {errors.bedrooms && (
              <p className="text-sm text-red-600 mt-1">{errors.bedrooms.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bathrooms">Μπάνια</Label>
            <Input
              id="bathrooms"
              type="number"
              min={0}
              step={1}
              {...register("bathrooms", {
                required: "Απαιτείται αριθμός μπάνιων",
                valueAsNumber: true,
                min: { value: 0, message: "Πρέπει να είναι ≥ 0" },
              })}
            />
            {errors.bathrooms && (
              <p className="text-sm text-red-600 mt-1">{errors.bathrooms.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="size">Εμβαδό (m²)</Label>
          <Input
            id="size"
            type="number"
            min={1}
            step={1}
            {...register("size", {
              required: "Το εμβαδό είναι υποχρεωτικό",
              valueAsNumber: true,
              min: { value: 1, message: "Πρέπει να είναι ≥ 1" },
            })}
          />
          {errors.size && <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>}
        </div>

        <div>
          <Label htmlFor="price">Τιμή (€ / μήνα)</Label>
          <Input
            id="price"
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.01}
            {...register("price", {
              required: "Η τιμή είναι υποχρεωτική",
              valueAsNumber: true,
              validate: {
                positive: (v) => (v ?? 0) > 0 || "Η τιμή πρέπει να είναι > 0",
                format: (v) => /^(\d{1,10})(\.\d{1,2})?$/.test(String(v)) ||
                  "Μέγιστο 10 ψηφία ακεραίου και 2 δεκαδικά",
              },
            })}
          />
          {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <Label>Τύπος ακινήτου</Label>
          <Select
            onValueChange={(val) => setValue("type", val as PropertyCreateForm["type"], { shouldValidate: true })}
            defaultValue="APARTMENT"
          >
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε τύπο" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APARTMENT">Διαμέρισμα</SelectItem>
              <SelectItem value="HOUSE">Μονοκατοικία</SelectItem>
              <SelectItem value="STUDIO">Γκαρσονιέρα</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
        </div>

        {msg && <p className="text-green-700">{msg}</p>}
        {err && <p className="text-red-700">{err}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </div>
      </form>
    </div>
  );
}
