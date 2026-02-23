import { Link, useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Menu, X, Store, HelpCircle, LayoutDashboard, Copy, Check, Settings } from "lucide-react";
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
          <Link to="/" className="flex items-center gap-2.5" onClick={() => scrollToSection("top")}>
            {/* EA Geometric Maze Logo */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shrink-0">
              <svg
                viewBox="0 0 40 40"
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Escrow Africa logo"
              >
                {/* Outer border */}
                <rect x="1" y="1" width="38" height="38" rx="2" fill="none" stroke="white" strokeWidth="3" />

                {/* Top-left U-channel (opens right) */}
                <rect x="5" y="5" width="14" height="3" fill="white" />
                <rect x="5" y="5" width="3" height="13" fill="white" />
                <rect x="5" y="15" width="9" height="3" fill="white" />

                {/* Top-right U-channel (opens down) */}
                <rect x="21" y="5" width="14" height="3" fill="white" />
                <rect x="32" y="5" width="3" height="13" fill="white" />
                <rect x="24" y="15" width="11" height="3" fill="white" />

                {/* Bottom-left U-channel (opens up) */}
                <rect x="5" y="22" width="11" height="3" fill="white" />
                <rect x="5" y="22" width="3" height="13" fill="white" />
                <rect x="5" y="32" width="14" height="3" fill="white" />

                {/* Bottom-right U-channel (opens left) */}
                <rect x="24" y="22" width="11" height="3" fill="white" />
                <rect x="32" y="22" width="3" height="13" fill="white" />
                <rect x="21" y="32" width="14" height="3" fill="white" />

                {/* Center square */}
                <rect x="16" y="16" width="8" height="8" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xl font-bold text-primary tracking-tight">Escrow Africa</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground tracking-[0.2em] uppercase">
                <span className="w-5 h-[1.5px] bg-muted-foreground/50 inline-block"></span>
                EA
                <span className="w-5 h-[1.5px] bg-muted-foreground/50 inline-block"></span>
              </span>
            </div>
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
