import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FAQ } from "@/components/landing/FAQ";
import { TrustIndicators } from "@/components/landing/TrustIndicators";
import { Testimonials } from "@/components/landing/Testimonials";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Package,
  UserCheck,
  Download,
  Briefcase,
  BadgeCheck,
  ChevronUp,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  // Scroll-to-top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    {
      icon: Wallet,
      title: "Buyer Pays",
      description: "Buyer creates a transaction and makes payment. Funds are securely held by Escrow Africa.",
    },
    {
      icon: Package,
      title: "Seller Delivers",
      description: "Seller sees the payment is secured and delivers the product or service.",
    },
    {
      icon: UserCheck,
      title: "EA Releases",
      description: "Once buyer confirms receipt, EA verifies and releases funds to seller.",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your money is held safely until you're satisfied with your purchase.",
    },
    {
      icon: Lock,
      title: "Fraud Protection",
      description: "Protect yourself from online scams with our trusted escrow service.",
    },
    {
      icon: BadgeCheck,
      title: "Verified Transactions",
      description: "Every transaction is monitored and verified by our team.",
    },
  ];

  const productTypes = [
    { icon: Package, title: "Physical Products", description: "Electronics, clothing, vehicles" },
    { icon: Download, title: "Digital Products", description: "Software, files, courses" },
    { icon: Briefcase, title: "Services", description: "Freelance work, repairs, consulting" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Escrow Africa — Africa's Trusted Escrow Service</title>
        <meta
          name="description"
          content="Buy and sell online without fear. Escrow Africa protects your transactions across Africa by holding funds until both parties are satisfied."
        />
        <meta property="og:title" content="Escrow Africa — Africa's Trusted Escrow Service" />
        <meta property="og:description" content="Secure payments for buyers and sellers worldwide." />
        <meta property="og:image" content="/favicon.png" />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden flex-1 flex items-start pt-20 md:pt-0 md:items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 gradient-hero opacity-[0.03] pointer-events-none" />
        <div className="container mx-auto px-4 py-12 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Africa's Trusted Escrow Service
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Buy & Sell{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Without Fear
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Escrow Africa protects your transactions by holding funds until both parties are satisfied.
              No more scams. No more lost money.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gradient-hero border-0 gap-2 px-8 text-base"
                onClick={handleGetStarted}
              >
                Start Secure Transaction
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Types */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
            What Can You Trade?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {productTypes.map((type, index) => (
              <Card key={index} className="border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-escrow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <type.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How Escrow Africa Works</h2>
            <p className="text-muted-foreground">
              Simple, secure, and transparent. Complete your transaction in 3 easy steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-escrow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose Escrow Africa?</h2>
            <p className="text-muted-foreground">
              Built with security and trust at its core for buyers and sellers worldwide.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-card shadow-escrow-md">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <feature.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-0 gradient-hero">
            <CardContent className="p-12 md:p-16 text-center text-primary-foreground">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Trade Securely?
              </h2>
              <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">
                Join thousands of users who trust Escrow Africa for their online transactions.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 text-base"
                onClick={handleGetStarted}
              >
                <CheckCircle2 className="h-5 w-5" />
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border bg-card shadow-lg transition-all hover:shadow-xl hover:scale-105"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5 text-primary" />
        </button>
      )}

      <Footer />
    </div>
  );
}
