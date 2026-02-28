import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { client } from "@/api/supabase/client";
import { userService } from "@/api/services/user.service";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
  const handleCallback = async () => {
    try {
      const { data } = await client.auth.getSession();

      if (!data.session) {
        navigate("/login");
        return;
      }

      const user = data.session.user;

      const existingUser = await userService.getById(user.id);

      if (existingUser) {
        navigate("/");
      } else {
        navigate("/complete-profile");
      }

    } catch (error) {
      console.error(error);
      navigate("/login");
    }
  };

  handleCallback();
}, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Autenticando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;