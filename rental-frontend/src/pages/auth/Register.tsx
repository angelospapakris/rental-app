import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  fullName: z.string().min(2),
  // μπορείς να προσθέσεις phone, address κλπ
});
type Form = z.infer<typeof Schema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(Schema) });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (data: Form) => {
    try {
      setErr(null);
      await registerUser(data);
      setOk(true);
      setTimeout(()=>nav("/login"), 1200);
    } catch (e: any) {
      setErr(e.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4 font-semibold">Εγγραφή</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>Ονοματεπώνυμο</Label>
          <Input {...register("fullName")} />
          {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" {...register("password")} />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        {ok && <p className="text-green-700 text-sm">Επιτυχής εγγραφή! Συνέχισε με login.</p>}
        <Button type="submit" className="w-full">Εγγραφή</Button>
      </form>
    </div>
  );
}
