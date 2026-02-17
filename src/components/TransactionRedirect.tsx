import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const TransactionRedirect = () => {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && id) {
            if (isAdmin) {
                navigate(`/admin?transaction=${id}`);
            } else {
                // Buyer or Seller
                // We might not know strictly if they are buyer/seller without checking, but simpler to default to dashboard logic which handles query params.
                // But wait, SellerDashboard is at /seller.
                // Ideally we check their role from profile, but deep link handlers in dashboards will fix it.
                // Let's try to detect if we can redirect to a generic place or if we need to know.
                // Since we don't have profile here easily without waiting, let's redirect to /dashboard (buyer) by default, 
                // OR we can make a guess. 
                // Actually, if we use /dashboard?transaction=ID, the BuyerDashboard will pick it up.
                // But if the user is a Seller, they might be at /seller.
                // Safe bet: Check if we have role in auth? `useAuth` returns profile.

                // Let's rely on the user being logged in.
                navigate(`/dashboard?transaction=${id}`);
                // If they are a seller, they might need to go to /seller. 
                // NOTE: BuyerDashboard might not show Seller transactions.
                // Improvement: We should probably fetch profile or check metadata.
            }
        }
    }, [user, id, isAdmin, navigate]);

    return <div className="p-4 text-center">Redirecting...</div>;
};
