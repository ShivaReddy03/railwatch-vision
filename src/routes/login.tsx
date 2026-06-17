import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { ROLES, type Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrainFront, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("operator");
  const [password, setPassword] = useState("railoptic");
  const [role, setRole] = useState<Role>("railway_board");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password, role);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 30%, oklch(0.55 0.16 245 / 0.4), transparent 60%)" }} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
              <TrainFront className="size-8 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight">
                <span className="text-foreground">RAIL</span>
                <span className="text-critical">OPTIC</span>
              </div>
              <div className="text-sm text-muted-foreground">AI-Powered Railway Object Detection System</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-3">Mission-control for the rails.</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Real-time obstruction detection, network-wide health monitoring, and incident response — purpose-built for 24/7 railway operations.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <Stat label="Nodes" value="500+" />
              <Stat label="Trains tracked" value="500+" />
              <Stat label="Uptime" value="98.2%" />
            </div>
          </div>
        </motion.div>

        <div className="relative text-xs text-muted-foreground">© 2026 RailOptic. Enterprise Edition.</div>
      </div>

      {/* Right login */}
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <TrainFront className="size-6 text-primary" />
            <div className="text-2xl font-bold"><span>RAIL</span><span className="text-critical">OPTIC</span></div>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold">Sign in to your console</h1>
            <p className="text-sm text-muted-foreground mt-1">Use your operator credentials</p>

            <form onSubmit={onSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="operator" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                Login
              </Button>
              <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground">Forgot password?</button>
            </form>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Demo: any username/password works. Choose a role to see role-based access.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
