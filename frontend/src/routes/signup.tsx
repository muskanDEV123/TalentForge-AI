import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/Shell";
import { apiSignup } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — ATS Resume Analyzer" }] }),
  component: SignupPage,
});

function Field({ label, icon, type, placeholder, value, onChange }: {
  label: string; icon: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-secondary mb-1.5">{label}</label>
      <div className="relative group">
        <Icon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} required
          className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-base text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
        />
      </div>
    </div>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("Please agree to the Terms of Service."); return; }
    setLoading(true);
    try {
      await apiSignup(name, email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f7f9fb" }}>
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-primary-container mb-4 shadow-sm">
              <Icon name="description" filled className="text-on-primary-container text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">ATS Resume Analyzer</h1>
            <p className="text-on-surface-variant mt-2">Join thousands of professionals optimizing their careers</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 flex items-center gap-2">
              <Icon name="error" className="text-error text-sm shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="glass-card rounded-xl p-8" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <form onSubmit={submit} className="space-y-6">
              <Field label="Full Name" icon="person" type="text" placeholder="John Doe" value={name} onChange={setName} />
              <Field label="Email Address" icon="mail" type="email" placeholder="name@company.com" value={email} onChange={setEmail} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Password" icon="lock" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
                <Field label="Confirm Password" icon="lock_reset" type="password" placeholder="••••••••" value={confirm} onChange={setConfirm} />
              </div>
              <label className="flex items-start gap-3 text-xs text-on-surface-variant cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <span>I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</span>
              </label>
              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
                style={{ background: loading ? "#1D4ED8" : "#2563EB" }}
              >
                {loading ? (<><Icon name="sync" className="animate-spin" /> Creating account…</>) :
                 (<>Create Account <Icon name="arrow_forward" className="text-[18px]" /></>)}
              </button>
              <p className="text-center text-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">Log in instead</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
