import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../store/auth";
import { Brand } from "../components/Brand";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const nav = useNavigate();
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRegister && !name.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      nav("/");
    } catch (err) {
      setError((err as Error).message.replace(/^\d+:\s*/, ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-paper flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gold/20 bg-ivory/70 px-6 py-4">
        <Brand small />
        <Link to="/" className="btn-ghost"><ArrowLeft size={16} /> Home</Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
          <h1 className="font-display text-2xl text-maroon">
            {isRegister ? "Create your account" : "Sign in"}
          </h1>
          {isRegister && (
            <label className="block">
              <span className="label">Name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
            </label>
          )}
          <label className="block">
            <span className="label">Email</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" />
          </label>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
          <p className="text-center text-sm text-maroon/70">
            {isRegister ? (
              <>Already have an account? <Link to="/login" className="font-semibold underline">Sign in</Link></>
            ) : (
              <>New here? <Link to="/register" className="font-semibold underline">Create an account</Link></>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}
