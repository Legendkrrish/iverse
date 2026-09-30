"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, User, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("usernameOrEmail", usernameOrEmail);
      formData.append("password", password);

      const res = await loginAdmin(formData);
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "Invalid username or password");
      }
    } catch (err: any) {
      if (err?.message?.includes("Server Action") || err?.message?.includes("failed-to-find-server-action") || err?.message?.includes("not found on the server")) {
        setError("New version deployed. Refreshing page...");
        setTimeout(() => window.location.reload(), 800);
        return;
      }
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/logo.png" alt="iVerse Logo" className="h-20 w-auto object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">iVerse Store</h1>
          <p className="text-sm text-muted-foreground">Admin Portal & Billing Management</p>
        </div>

        {/* Login Form Card */}
        <Card className="glass-panel border-border/60 shadow-xl rounded-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold">Admin Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access the store panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-semibold">Username / Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin@iverse.store or admin"
                    className="pl-9 bg-black/5 dark:bg-white/5 border-none h-10 text-sm rounded-xl focus-visible:ring-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-9 bg-black/5 dark:bg-white/5 border-none h-10 text-sm rounded-xl focus-visible:ring-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Admin Panel"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/40 text-center text-[11px] text-muted-foreground">
              Default Admin: <span className="font-mono text-foreground font-semibold">admin</span> | Pass: <span className="font-mono text-foreground font-semibold">iverse@2026</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
