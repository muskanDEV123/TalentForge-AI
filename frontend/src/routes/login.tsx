import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Shell";
import { apiLogin } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — ATS Resume Analyzer" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiLogin(email, password);
      setDone(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f7f9fb" }}>
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-container/40 rounded-full blur-3xl" />

        <div className="w-full max-w-md z-10 bg-surface-container-lowest rounded-xl p-8 md:p-10" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Icon name="description" filled className="text-on-primary-container text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface text-center mb-2">ATS Resume Analyzer</h1>
            <p className="text-on-surface-variant text-center">Optimize your career path with AI.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/30 flex items-center gap-2">
              <Icon name="error" className="text-error text-sm shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-1.5">Email Address</label>
              <div className="relative group">
                <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-secondary">Password</label>
                <a href="#" className="text-primary text-xs font-medium hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading || done}
              className={`w-full ${done ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary-container hover:bg-primary text-on-primary-container"} font-semibold py-3.5 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2`}
            >
              {loading ? (<><Icon name="sync" className="animate-spin" /> Authenticating...</>) :
               done ? (<><Icon name="check_circle" /> Welcome back!</>) :
               (<>Login <Icon name="login" /></>)}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-outline-variant" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-surface-container-lowest text-on-surface-variant">New here?</span></div>
          </div>

          <p className="text-center text-sm text-on-surface-variant">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Sign up free</Link>
          </p>
        </div>
      </main>

      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto border-t border-outline-variant gap-4">
        <span className="text-sm text-on-surface-variant">© 2024 ATS Resume Analyzer. All rights reserved.</span>
        <div className="flex gap-6 text-sm">
          <a href="#" className="text-on-surface-variant hover:text-on-surface">Privacy Policy</a>
          <a href="#" className="text-on-surface-variant hover:text-on-surface">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
