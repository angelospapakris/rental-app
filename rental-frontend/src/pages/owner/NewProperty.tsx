import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type Form = { title: string; description?: string; city?: string; price?: number };

export default function NewProperty() {
  const { register, handleSubmit } = useForm<Form>();
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (f: Form) => {
    setMsg(null);
    await api.post(ENDPOINTS.properties.create, f);
    setMsg("Η καταχώριση υποβλήθηκε και αναμένει έγκριση από Admin.");
    setTimeout(()=>nav("/owner/properties"), 900);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Νέα καταχώριση</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>Τίτλος</Label>
          <Input {...register("title", { required: true })} />
        </div>
        <div>
          <Label>Περιγραφή</Label>
          <Textarea rows={4} {...register("description")} />
        </div>
        <div>
          <Label>Πόλη</Label>
          <Input {...register("city")} />
        </div>
        <div>
          <Label>Τιμή (€ / μήνα)</Label>
          <Input type="number" step="1" {...register("price", { valueAsNumber: true })} />
        </div>
        {msg && <p className="text-green-700">{msg}</p>}
        <Button type="submit">Αποθήκευση</Button>
      </form>
    </div>
  );
}
