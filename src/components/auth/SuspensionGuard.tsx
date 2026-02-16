import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function SuspensionGuard() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user && profile?.status === 'suspended' && location.pathname !== '/suspended') {
            navigate('/suspended');
        }

        // Also prevent suspended users from accessing anything other than /suspended
        // But allow non-logged in users (user is null)

    }, [user, profile, location.pathname, navigate]);

    return null;
}
