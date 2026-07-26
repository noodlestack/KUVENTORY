import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function SessionExpired() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogin = () => {
    logout();
    navigate("/login");
  };

  return (
    <AuthCard
      title="Session Expired"
      description="Your session has expired due to inactivity. Please log in again to continue."
    >
      <div className="flex flex-col items-center space-y-6 py-4">
        <div className="rounded-full bg-warning/10 p-4">
          <Clock className="h-10 w-10 text-warning" />
        </div>
        <Button onClick={handleLogin} className="w-full">
          Login Again
        </Button>
      </div>
    </AuthCard>
  );
}
