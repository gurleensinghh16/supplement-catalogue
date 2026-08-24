import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Send them to /auth, but remember where they were headed so you
    // can redirect back after a successful sign-in if you want that later.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}