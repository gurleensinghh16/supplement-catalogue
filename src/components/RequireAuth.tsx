import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

/**
 * Wrap protected routes with this component.
 * Example (in your router):
 *
 * <Route element={<RequireAuth />}>
 *   <Route path="/admin" element={<AdminPage />} />
 * </Route>
 */
export default function RequireAuth() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname);
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
}