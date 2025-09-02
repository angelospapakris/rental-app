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
});
type Form = z.infer<typeof Schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(Schema) });
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (data: Form) => {
    try {
      setErr(null);
      await login(data.email, data.password);
      nav("/");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4 font-semibold">Σύνδεση</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label>password</Label>
          <Input type="password" {...register("password")} />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <Button type="submit" className="w-full">Login</Button>
      </form>
    </div>
  );
}
