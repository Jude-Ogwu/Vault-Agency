import { useState } from "react";
import { Mail, Phone, MessageCircle, X, Headphones, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_PHONE = "+2348144919893";
const ADMIN_EMAIL = "ogwujude872@gmail.com";
const WHATSAPP_LINK = `https://wa.me/2348144919893?text=${encodeURIComponent("Hi TrustLock, I need assistance with...")}`;

export function SupportWidget() {
    const [open, setOpen] = useState(false);

    const now = new Date();
    const hour = now.getHours();
    const isCallHours = hour >= 8 && hour < 18;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded widget */}
            {open && (
                <div className="mb-3 w-72 rounded-2xl border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
                    {/* Header */}
                    <div className="gradient-hero p-4 text-primary-foreground">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Headphones className="h-5 w-5" />
                                <span className="font-semibold">Customer Support</span>
                            </div>
                            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs opacity-80 mt-1">We're here to help!</p>
                    </div>

                    {/* Options */}
                    <div className="p-3 space-y-2">
                        {/* WhatsApp */}
                        <a
                            href={WHATSAPP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl p-3 bg-primary/5 hover:bg-primary/10 transition-colors group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">WhatsApp</p>
                                <p className="text-xs text-muted-foreground">Quick response • Always available</p>
                            </div>
                        </a>

                        {/* Email */}
                        <a
                            href={`mailto:${ADMIN_EMAIL}?subject=TrustLock Support Request`}
                            className="flex items-center gap-3 rounded-xl p-3 bg-secondary/5 hover:bg-secondary/10 transition-colors group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary shrink-0">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Email Us</p>
                                <p className="text-xs text-muted-foreground">{ADMIN_EMAIL}</p>
                            </div>
                        </a>

                        {/* Call */}
                        <div className="relative">
                            {isCallHours ? (
                                <a
                                    href={`tel:${ADMIN_PHONE}`}
                                    className="flex items-center gap-3 rounded-xl p-3 bg-primary/5 hover:bg-primary/10 transition-colors group"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Call Us</p>
                                        <p className="text-xs text-muted-foreground">Available now • 08144919893</p>
                                    </div>
                                </a>
                            ) : (
                                <div className="flex items-center gap-3 rounded-xl p-3 bg-muted/50 opacity-60">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Call Us</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Mon–Sun, 8 AM – 6 PM
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t px-4 py-2.5 text-center">
                        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            Call hours: Mon – Sun, 8 AM – 6 PM
                        </p>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <Button
                onClick={() => setOpen(!open)}
                className={`h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 ${open ? "bg-muted-foreground hover:bg-muted-foreground/90" : "gradient-hero"
                    }`}
                size="icon"
            >
                {open ? <X className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
            </Button>
        </div>
    );
}
