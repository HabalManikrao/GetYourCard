import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";
import { UNAUTHORIZED_EVENT } from "../lib/authToken";

/** Initializes auth (config + session) and reacts to 401s app-wide. */
export function AuthGate() {
  const init = useAuth((s) => s.init);
  const ready = useAuth((s) => s.ready);

  useEffect(() => {
    init();
    const onUnauthorized = () => useAuth.getState().onUnauthorized();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [init]);

  if (!ready) {
    return (
      <div className="bg-paper flex min-h-screen items-center justify-center font-display text-xl text-maroon">
        Loading…
      </div>
    );
  }
  return <Outlet />;
}

/** Guards protected routes. No-op in guest mode; redirects to /login in shared mode. */
export function RequireAuth() {
  const authRequired = useAuth((s) => s.authRequired);
  const user = useAuth((s) => s.user);
  if (authRequired && !user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
