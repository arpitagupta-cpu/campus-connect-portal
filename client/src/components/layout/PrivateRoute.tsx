import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface PrivateRouteProps {
  component: React.ComponentType;
  role: "student" | "admin";
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, role }) => {
  const { currentUser, userRole, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      setLocation("/login");
    } else if (!loading && currentUser && userRole !== role) {
      if (userRole === "student") {
        setLocation("/student/dashboard");
      } else if (userRole === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/login");
      }
    }
  }, [currentUser, loading, setLocation, userRole, role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="w-full max-w-md p-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-40 w-full mt-8" />
        </div>
      </div>
    );
  }

  if (!currentUser || userRole !== role) {
    return null;
  }

  return <Component />;
};

export default PrivateRoute;
