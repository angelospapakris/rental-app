import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { RegisterForm } from "@/types";

const RegisterSchema = z.object({
  email: z.string().email("Μη έγκυρο email"),
  username: z.string().min(3, "Το username πρέπει να έχει τουλάχιστον 3 χαρακτήρες"),
  password: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "Ο κωδικός πρέπει να περιέχει γράμματα και αριθμούς"),
  firstname: z.string().min(2, "Το μικρό όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
  lastname: z.string().min(2, "Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  role: z.enum(["TENANT", "OWNER"]).default("TENANT"),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: "TENANT" },
  });

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setErr(null);
      await registerUser(data);
      setOk(true);
      setTimeout(() => nav("/login"), 1200);
    } catch (e: any) {
      setErr(e.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4 font-semibold">Εγγραφή</h1>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label>Username</Label>
            <Input {...register("username")} />
            {errors.username && (
              <p className="text-red-600 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Όνομα</Label>
              <Input {...register("firstname")} />
              {errors.firstname && (
                <p className="text-red-600 text-sm">{errors.firstname.message}</p>
              )}
            </div>
            <div>
              <Label>Επώνυμο</Label>
              <Input {...register("lastname")} />
              {errors.lastname && (
                <p className="text-red-600 text-sm">{errors.lastname.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Κωδικός</Label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label>Τηλέφωνο επικοινωνίας</Label>
            <Input type="tel" placeholder="69xxxxxxxx" {...register("phone")} />
          </div>

          <div>
            <Label>Ρόλος</Label>
            <select
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("role")}
            >
              <option value="TENANT">Ενοικιαστής</option>
              <option value="OWNER">Ιδιοκτήτης</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm">{errors.role.message}</p>
            )}
          </div>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {ok && (
          <p className="text-green-700 text-sm">
            Επιτυχής εγγραφή! Αυτόματη μεταφορά στη σελίδα σύνδεσης…
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Γίνεται εγγραφή..." : "Εγγραφή"}
        </Button>
      </form>
    </div>
  );
}
