import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { WonBillsContext } from "../store/WonBillsContext";
import { getAuthenticatedUser } from "../services/authService";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function ProtectedRoute({
  allowedRoles = [],
  publicOnly = false
}) {
  const {
    isLoggedIn,
    userRole,
    setIsLoggedIn,
    setUserRole,
    setUserID,
    setSelecetdTemplate,
    setCompanyName,
    setBusinessLogo
  } = useContext(WonBillsContext);

  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (isLoggedIn) {
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (!mounted || !user?.role) throw new Error("Invalid session");

        setUserID(user.reference_id);
        setUserRole(user.role);
        setSelecetdTemplate(user.template || 1);
        setIsLoggedIn(true);
        setCompanyName(user?.company_name);
        setBusinessLogo(user?.logo)
      } catch {
        if (!mounted) return;
        setIsLoggedIn(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, setIsLoggedIn, setUserID, setUserRole, setSelecetdTemplate]);

  if (loading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="w-1/2 h-1/2">
          {" "}
          <DotLottieReact
            src="https://lottie.host/37399f70-9f8e-457a-b73c-b3aef3cee883/XxGmbXKH0Q.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    );

  // --- REDIRECTION LOGIC ---

  if (isLoggedIn && publicOnly) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isLoggedIn && !publicOnly) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && isLoggedIn && !allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
