import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — RONIN" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Credenciales incorrectas");
    } else {
      navigate({ to: "/admin/" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-2">RONIN</p>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Panel Admin</h1>
        </div>
        <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="admin@ronin.co"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition rounded-md"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /> Entrar</>}
          </button>
        </form>
      </div>
    </div>
  );
}
