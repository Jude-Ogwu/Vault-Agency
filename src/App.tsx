import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";
import { SupportWidget } from "@/components/layout/SupportWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<BuyerDashboard />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        <SupportWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
