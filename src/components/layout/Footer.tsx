import { Shield, Mail, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

const WHATSAPP_LINK = `https://wa.me/2348144919893?text=${encodeURIComponent("Hi Escrow Nigeria, I need assistance with...")}`;

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid gap-8 md:grid-cols-4 text-center">
          {/* Brand */}
          <div className="space-y-4 flex flex-col items-center">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Nigeria's trusted escrow service for secure online transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">New Transaction</Link></li>
              <li><Link to="/seller" className="hover:text-foreground">Seller Portal</Link></li>
              <li><Link to="/marketplace" className="hover:text-foreground">Marketplace</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col items-center">
            <h4 className="mb-4 text-sm font-semibold">Contact Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:ogwujude872@gmail.com?subject=Escrow Nigeria Support" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" /> ogwujude872@gmail.com
                </a>
              </li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </li>
              <li>
                <a href="tel:+2348144919893" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Phone className="h-3.5 w-3.5" /> 08144919893
                </a>
              </li>
              <li className="text-xs text-muted-foreground/70">
                Call hours: Mon–Sun, 8 AM – 6 PM
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center">
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/legal/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/legal/refund" className="hover:text-foreground">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Escrow Nigeria. All rights reserved.</p>
          <p className="mt-1">Proudly serving businesses and consumers across Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
