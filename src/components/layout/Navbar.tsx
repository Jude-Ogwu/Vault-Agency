import { Link, useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Shield, LogOut, User, Menu, X, Store, HelpCircle, LayoutDashboard, Copy, Check, Settings } from "lucide-react";
import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NotificationCenter } from "../notifications/NotificationCenter";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const userShortId = user ? user.id.slice(0, 8).toUpperCase() : null;

  const handleCopyId = () => {
    if (userShortId) {
      navigator.clipboard.writeText(userShortId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Hard redirect to fully clear all React state and start fresh on login page
    window.location.href = "/login";
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
            {/* Africa map logo */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shrink-0">
              <svg
                viewBox="0 0 100 120"
                className="h-5 w-5"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Africa map"
              >
                {/* Africa continent silhouette */}
                <path d="M50 4 C38 4 28 8 22 16 C16 24 14 34 16 42 C14 46 10 50 10 56 C10 62 14 68 16 72 C18 80 16 88 20 96 C24 104 32 112 40 116 C44 118 48 120 50 120 C52 120 56 118 60 116 C68 112 76 104 80 96 C84 88 82 80 84 72 C86 68 90 62 90 56 C90 50 86 46 84 42 C86 34 84 24 78 16 C72 8 62 4 50 4 Z M50 8 C61 8 70 12 75 19 C80 26 80 35 78 42 L76 44 C79 48 83 52 83 56 C83 61 79 66 77 70 C75 78 77 86 73 93 C69 100 62 108 55 112 C53 114 51 115 50 115 C49 115 47 114 45 112 C38 108 31 100 27 93 C23 86 25 78 23 70 C21 66 17 61 17 56 C17 52 21 48 24 44 L22 42 C20 35 20 26 25 19 C30 12 39 8 50 8 Z" />
                <ellipse cx="65" cy="28" rx="8" ry="6" opacity="0.6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary">Escrow Africa</span>
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
              onClick={() => navigate("/how-it-works")}
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
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {/* User's own ID — for identity verification */}
                    {userShortId && (
                      <>
                        <div className="px-2 py-1.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Your ID</p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold tracking-widest text-sm">{userShortId}</span>
                            <button
                              onClick={handleCopyId}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy your ID"
                            >
                              {copiedId ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
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
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
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
                onClick={() => { navigate("/how-it-works"); setMobileMenuOpen(false); }}
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
                  {/* Mobile: YOUR ID card */}
                  {userShortId && (
                    <div className="mx-2 rounded-lg border bg-muted/50 px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Your ID</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold tracking-widest text-sm">{userShortId}</span>
                        <button
                          onClick={handleCopyId}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy your ID"
                        >
                          {copiedId ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
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
                  {/* Mobile Menu - EA Link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      EA Dashboard
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
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
                  <div className="flex justify-center py-2 border-t mt-2 gap-4">
                    <ModeToggle />
                    <NotificationCenter />
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
