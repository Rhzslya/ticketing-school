import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/enum/user";
import { useUserQueries } from "@/hooks/user-queries";

export const GuestRoute = () => {
  const { useProfile } = useUserQueries();
  const { data: user, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { useProfile } = useUserQueries();
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
export const AdminRoute = () => {
  const { useProfile } = useUserQueries();
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthorized = user && user.role === UserRole.ADMIN;

  if (isError || !isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
