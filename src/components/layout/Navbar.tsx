import { Link, useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Shield, LogOut, User, Menu, X, Store, HelpCircle } from "lucide-react";
import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Hard redirect to fully clear all React state and start fresh
    window.location.href = "/";
  };

  // Smooth-scroll to a section on the landing page
  const scrollToSection = useCallback(
    (sectionId: string) => {
      setMobileMenuOpen(false);

      const doScroll = () => {
        if (sectionId === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }
      };

      if (location.pathname === "/") {
        // Already on landing page — just scroll
        doScroll();
      } else {
        // Navigate to landing first, then scroll after the page renders
        navigate("/");
        setTimeout(doScroll, 300);
      }
    },
    [location.pathname, navigate]
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => scrollToSection("top")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Vault Agency</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => scrollToSection("top")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("faqs")}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              FAQs
            </button>
            <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <Store className="h-3.5 w-3.5" />
              Marketplace
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      Buyer Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/seller")}>
                      Seller Dashboard
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Log In
                </Button>
                <div className="hidden md:block">
                  <ModeToggle />
                </div>
                <Button onClick={() => navigate("/signup")} className="gradient-hero border-0">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <button
                className="px-2 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => scrollToSection("top")}
              >
                Home
              </button>
              <button
                className="px-2 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => scrollToSection("how-it-works")}
              >
                How It Works
              </button>
              <button
                className="px-2 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
                onClick={() => scrollToSection("faqs")}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                FAQs
              </button>
              <Link
                to="/marketplace"
                className="px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store className="h-3.5 w-3.5" />
                Marketplace
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Buyer Dashboard
                  </Link>
                  <Link
                    to="/seller"
                    className="px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                  <div className="flex justify-center py-2 border-t mt-2">
                    <ModeToggle />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Log In
                  </Button>
                  <div className="flex justify-center py-2">
                    <ModeToggle />
                  </div>
                  <Button onClick={() => navigate("/signup")} className="gradient-hero border-0">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
