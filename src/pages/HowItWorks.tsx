import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
    ArrowLeft, ShieldCheck, UserPlus, PlusCircle, Link2, CreditCard, Truck,
    CheckCircle2, AlertTriangle, Lock, Bell, Settings, Headphones, Info,
    Users, BadgeCheck, DollarSign, Package, Download, Briefcase,
    Eye, Copy, Star, Zap, HelpCircle, MessageSquare, FileText
} from "lucide-react";

interface Tip {
    icon: React.ElementType;
    title: string;
    body: string;
}

function TipCard({ icon: Icon, title, body }: Tip) {
    return (
        <div className="flex gap-3 p-4 rounded-xl border bg-card">
            <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
                <p className="font-semibold text-sm mb-0.5">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{label}</h2>
        </div>
    );
}

function StepBadge({ n, label }: { n: number; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {n}
            </div>
            <span className="font-medium text-sm">{label}</span>
        </div>
    );
}

function Callout({ type, text }: { type: "info" | "tip" | "warning"; text: string }) {
    const styles = {
        info: { bg: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400", Icon: Info },
        tip: { bg: "bg-success/10 border-success/30 text-success", Icon: Zap },
        warning: { bg: "bg-warning/10 border-warning/30 text-warning", Icon: AlertTriangle },
    }[type];
    const { bg, Icon } = styles;
    return (
        <div className={`flex gap-2.5 rounded-xl border p-4 ${bg}`}>
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed">{text}</p>
        </div>
    );
}

export default function HowItWorks() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full space-y-10">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                {/* Hero */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        Platform Guide
                    </div>
                    <h1 className="text-3xl font-bold">How Escrow Africa Works</h1>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                        A complete, step-by-step guide to everything on the platform. Read this before you start — it'll save you time and protect your money.
                    </p>
                </div>

                {/* ─── 1. What is Escrow Africa? ──────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={ShieldCheck} label="1. What is Escrow Africa?" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Escrow Africa (EA) is a secure middleman platform for online transactions in Nigeria. Whether you're buying or selling a physical product, digital file, or service — EA holds the buyer's money safely until the seller delivers, then releases it. <strong>Nobody loses money to scams.</strong>
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <TipCard icon={Package} title="Physical Products" body="Electronics, vehicles, clothing, furniture — anything shipped or handed over." />
                        <TipCard icon={Download} title="Digital Products" body="Software, courses, designs, files, accounts — anything delivered digitally." />
                        <TipCard icon={Briefcase} title="Services" body="Freelance work, repairs, consulting, design, coding — any skill-based work." />
                    </div>
                    <Callout type="tip" text="EA is the safest way to transact with strangers online in Nigeria. Funds never reach the seller until you're satisfied." />
                </section>

                {/* ─── 2. Registration ──────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={UserPlus} label="2. Creating Your Account" />
                    <div className="space-y-3">
                        <StepBadge n={1} label="Click 'Get Started' → Sign up with your email and a secure password." />
                        <StepBadge n={2} label="Check your email for a confirmation link — click it to verify your account." />
                        <StepBadge n={3} label="Log in and complete your profile (full name & phone) in Settings." />
                    </div>
                    <Callout type="info" text="Your email is your login identity. It is never shown publicly — only your 8-character Unique ID is visible to other users." />
                </section>

                {/* ─── 3. Your Unique ID ───────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={BadgeCheck} label="3. Your Unique ID" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Every user gets a permanent 8-character ID (e.g. <span className="font-mono font-bold">3E604106</span>). This is how other users identify you — not by name or email.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <TipCard icon={Eye} title="Where to find it" body="Top-right dropdown menu on desktop, or in Settings (/settings) on any device." />
                        <TipCard icon={Copy} title="How to use it" body="Share your ID with your trading partner before a deal so they can verify it's really you." />
                        <TipCard icon={Users} title="Why not a name?" body="Names can be faked. IDs are unique, random, and can't be guessed from your email or name." />
                        <TipCard icon={Lock} title="Privacy protected" body="Your email is never shown to sellers, buyers, or the public — only your ID is." />
                    </div>
                </section>

                {/* ─── 4. Creating a Transaction (Buyer) ───────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={PlusCircle} label="4. Creating a Deal (Buyer)" />
                    <p className="text-sm text-muted-foreground">As the buyer, you initiate every transaction. Here's the full flow:</p>
                    <div className="space-y-3">
                        <StepBadge n={1} label="Go to your Buyer Dashboard → click 'New Transaction'." />
                        <StepBadge n={2} label="Enter the deal title, description, amount (₦), and product type." />
                        <StepBadge n={3} label="Submit the form — an invite link is automatically generated for your seller." />
                        <StepBadge n={4} label="Copy and share the invite link with your seller via WhatsApp, Telegram, or any platform." />
                        <StepBadge n={5} label="Wait for the seller to accept and join using the link." />
                        <StepBadge n={6} label="Once the seller joins, you'll be notified to proceed with payment." />
                    </div>
                    <Callout type="tip" text="The amount you enter is exactly what the seller receives. The EA service fee is added on top — you pay slightly more, seller gets the full amount." />
                </section>

                {/* ─── 5. Invite Link ───────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={Link2} label="5. The Invite Link (Seller)" />
                    <p className="text-sm text-muted-foreground">The seller receives a unique invite link from the buyer. Here's what they need to do:</p>
                    <div className="space-y-3">
                        <StepBadge n={1} label="Open the invite link the buyer shared — it works in any browser." />
                        <StepBadge n={2} label="Review the deal: title, description, amount (what you'll receive), and buyer's ID." />
                        <StepBadge n={3} label="If you don't have an account, create one — it's free. Then log in." />
                        <StepBadge n={4} label="Click 'Accept Deal as Seller' — you're now the official seller on this transaction." />
                        <StepBadge n={5} label="Go to your Seller Dashboard to track the transaction." />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <TipCard icon={AlertTriangle} title="Invite links expire" body="Each invite link is valid for 72 hours. If expired, ask the buyer to generate a new one." />
                        <TipCard icon={Lock} title="One use only" body="Each link can only be accepted by one person. Once used, it's permanently deactivated." />
                        <TipCard icon={BadgeCheck} title="Check the Buyer ID" body="Before accepting, verify the buyer's 8-char ID matches who you're talking to on WhatsApp/Telegram." />
                        <TipCard icon={Eye} title="Fee transparency" body="The invite page clearly shows Deal Amount, EA Fee, and Buyer Total — no hidden charges." />
                    </div>
                    <Callout type="warning" text="Never accept an invite link from someone you haven't verified! Always cross-check the Buyer ID shown on the invite page against what your trading partner told you." />
                </section>

                {/* ─── 6. Service Fee ───────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={DollarSign} label="6. EA Service Fee" />
                    <div className="rounded-xl border overflow-hidden">
                        <div className="grid grid-cols-3 bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
                            <span>Transaction Amount</span>
                            <span className="text-center">Fee Rate</span>
                            <span className="text-right">Who Pays?</span>
                        </div>
                        <div className="grid grid-cols-3 px-4 py-3 text-sm border-t">
                            <span>Below ₦10,000</span>
                            <span className="text-center font-bold text-primary">5%</span>
                            <span className="text-right text-muted-foreground">Buyer</span>
                        </div>
                        <div className="grid grid-cols-3 px-4 py-3 text-sm border-t bg-success/5">
                            <span>₦10,000 and above</span>
                            <span className="text-center font-bold text-success">2%</span>
                            <span className="text-right text-muted-foreground">Buyer</span>
                        </div>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1.5">
                        <p className="font-semibold">Example: Deal for ₦85,000</p>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Deal Amount (Seller receives)</span><span className="font-mono">₦85,000</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>EA Fee (2%)</span><span className="font-mono">₦1,700</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1.5">
                            <span>Buyer Pays Total</span><span className="font-mono">₦86,700</span>
                        </div>
                    </div>
                    <Callout type="info" text="The seller always receives the exact quoted amount. The EA fee is always paid on top by the buyer — it's never deducted from the seller's portion." />
                </section>

                {/* ─── 7. Making Payment ────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={CreditCard} label="7. Making Payment" />
                    <p className="text-sm text-muted-foreground">Once the seller accepts the invite, the buyer proceeds to payment. The funds are held in escrow — not sent to the seller yet.</p>
                    <div className="space-y-3">
                        <StepBadge n={1} label="Open your Buyer Dashboard → click on the transaction." />
                        <StepBadge n={2} label="You'll see the payment section — select your payment method." />
                        <StepBadge n={3} label="Currently supported: Crypto (BTC, USDT, ETH). Paystack, Stripe & PayPal coming soon." />
                        <StepBadge n={4} label="For crypto: copy the wallet address, send the exact amount shown, then upload your transaction proof (screenshot of successful send + TX hash)." />
                        <StepBadge n={5} label="EA team confirms your payment and moves the transaction to 'Held' status." />
                    </div>
                    <Callout type="warning" text="Always send the EXACT amount shown. Short sends or overpays may delay your transaction. Include the TX hash when submitting proof." />
                </section>

                {/* ─── 8. Delivery & Proof ──────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={Truck} label="8. Delivery & Proof Upload" />
                    <p className="text-sm text-muted-foreground">After payment is confirmed and held, the seller delivers. Both parties upload proof to protect themselves.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <TipCard icon={FileText} title="Seller Proof" body="Upload proof of delivery — shipping receipt, delivery photo, service completion screenshot, or any evidence the item/service was provided." />
                        <TipCard icon={CheckCircle2} title="Buyer Proof" body="Upload proof of receipt — photo of item received, screenshot of digital file download, or confirmation of service delivery." />
                        <TipCard icon={Star} title="Max file size" body="Proof files can be up to 5MB each. Use clear, readable screenshots or photos." />
                        <TipCard icon={Lock} title="Why it matters" body="Proof protects both sides. EA uses it to verify disputes. No proof = weak position in a dispute." />
                    </div>
                </section>

                {/* ─── 9. Fund Release ──────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={CheckCircle2} label="9. Fund Release" />
                    <div className="space-y-3">
                        <StepBadge n={1} label="Buyer confirms successful delivery in their dashboard." />
                        <StepBadge n={2} label="Both parties upload their respective proof." />
                        <StepBadge n={3} label="EA team reviews all proof — typically within 24–48 hours." />
                        <StepBadge n={4} label="EA approves and releases funds directly to the seller's payout account." />
                        <StepBadge n={5} label="Both parties receive a notification confirming the release." />
                    </div>
                    <Callout type="tip" text="Funds are only released after EA manually verifies both buyer and seller proof. This manual check is what makes Escrow Africa secure and scam-proof." />
                </section>

                {/* ─── 10. Disputes & Refunds ───────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={AlertTriangle} label="10. Disputes & Refunds" />
                    <p className="text-sm text-muted-foreground">Something went wrong? Don't worry — your money is still held safely in escrow.</p>
                    <div className="space-y-3">
                        <StepBadge n={1} label="Go to the transaction → click 'File a Complaint'." />
                        <StepBadge n={2} label="Explain exactly what went wrong. Be specific and factual." />
                        <StepBadge n={3} label="EA team reviews the complaint and all uploaded proof from both sides." />
                        <StepBadge n={4} label="If the seller is at fault, your money is refunded in full. If the buyer is at fault (e.g. false claim), funds are released to the seller." />
                    </div>
                    <Callout type="warning" text="False disputes are taken seriously. Always be honest — filing a false complaint can result in your account being suspended." />
                </section>

                {/* ─── 11. Dashboards ────────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={Users} label="11. Your Dashboards" />
                    <div className="grid sm:grid-cols-2 gap-3">
                        <TipCard icon={CreditCard} title="Buyer Dashboard" body="See all transactions you initiated as a buyer. Create new ones, track statuses, make payments, and confirm deliveries." />
                        <TipCard icon={Truck} title="Seller Dashboard" body="See all transactions where you're the seller. Track statuses, upload delivery proof, and monitor fund releases." />
                        <TipCard icon={MessageSquare} title="In-transaction Chat" body="Every transaction has a built-in chat between buyer and seller. Use it for updates — EA team can also see it during disputes." />
                        <TipCard icon={Eye} title="Transaction Status" body="Statuses: Pending Payment → Held → Pending Delivery → Completed, or Disputed/Refunded/Cancelled." />
                    </div>
                </section>

                {/* ─── 12. Notifications ─────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={Bell} label="12. Notifications" />
                    <p className="text-sm text-muted-foreground">The bell 🔔 icon in the top navbar is your notification center. It shows realtime alerts for everything that happens on your account.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <TipCard icon={Zap} title="Realtime" body="Notifications appear instantly — no need to refresh. The red dot means you have unread alerts." />
                        <TipCard icon={Bell} title="What you get notified for" body="Deal created, seller joined, payment confirmed, delivery done, dispute filed, fund released, profile changed, and more." />
                        <TipCard icon={CheckCircle2} title="Mark as read" body="Click a notification to mark it as read. Use 'Mark all read' to clear all at once." />
                        <TipCard icon={Settings} title="Settings changes" body="Any Profile or Security update (name, email, password) also creates a notification for your security awareness." />
                    </div>
                </section>

                {/* ─── 13. Settings ──────────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={Settings} label="13. Account Settings" />
                    <p className="text-sm text-muted-foreground">Access Settings from the top-right dropdown (desktop) or the mobile menu. You can:</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <TipCard icon={UserPlus} title="Edit your profile" body="Update your full name and phone number anytime. These are used by EA support to identify you." />
                        <TipCard icon={BadgeCheck} title="View your Unique ID" body="Copy your 8-char ID to share with trading partners for identity verification." />
                        <TipCard icon={MessageSquare} title="Change email" body="Enter a new email address — a confirmation link is sent to the new email before the change takes effect." />
                        <TipCard icon={Lock} title="Change password" body="Set a new password (min 6 characters). You'll get a security notification after the change." />
                    </div>
                </section>

                {/* ─── 14. Security Best Practices ──────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={ShieldCheck} label="14. Security Best Practices" />
                    <div className="rounded-xl border divide-y">
                        <div className="flex gap-3 p-3 items-start">
                            <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div><p className="text-sm font-medium">Always verify the Buyer/Seller ID</p><p className="text-xs text-muted-foreground">Before any transaction, confirm the 8-char ID of your partner matches what they told you on WhatsApp/Telegram.</p></div>
                        </div>
                        <div className="flex gap-3 p-3 items-start">
                            <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div><p className="text-sm font-medium">Never pay outside of EA</p><p className="text-xs text-muted-foreground">If anyone asks you to pay directly to their bank account instead of through EA, it's a scam. Always use EA's payment flow.</p></div>
                        </div>
                        <div className="flex gap-3 p-3 items-start">
                            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                            <div><p className="text-sm font-medium">Use a strong password</p><p className="text-xs text-muted-foreground">At least 8 characters with numbers and symbols. Never share your password with anyone — including EA support staff.</p></div>
                        </div>
                        <div className="flex gap-3 p-3 items-start">
                            <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div><p className="text-sm font-medium">Don't share your invite link publicly</p><p className="text-xs text-muted-foreground">Invite links are single-use and should only be sent to your intended seller/buyer — not posted in public groups.</p></div>
                        </div>
                        <div className="flex gap-3 p-3 items-start">
                            <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div><p className="text-sm font-medium">Monitor your security notifications</p><p className="text-xs text-muted-foreground">If you get a "Password Changed" or "Email Change Requested" notification you didn't initiate, contact support immediately.</p></div>
                        </div>
                    </div>
                </section>

                {/* ─── 15. Support ───────────────────────────────────────── */}
                <section className="space-y-4">
                    <SectionTitle icon={Headphones} label="15. Need Help or Support?" />
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Confused about something? Stuck on a step? Have an issue with a transaction? <strong className="text-foreground">EA support is always here.</strong>
                        </p>
                        <div className="flex items-start gap-3 rounded-lg bg-background border p-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Headphones className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">The Headphone Icon 🎧</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You'll find a <strong>green headphone button</strong> fixed at the <strong>bottom-right corner of every single page</strong> on Escrow Africa. Click it anytime to:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                                    <li>Chat with the EA support team</li>
                                    <li>Report a problem or suspicious activity</li>
                                    <li>Get help with a stuck transaction</li>
                                    <li>Ask any question about the platform</li>
                                    <li>Request a dispute review</li>
                                </ul>
                            </div>
                        </div>
                        <Callout type="tip" text="You don't need to log in to use support. The headphone button is available to all visitors — even before you sign up." />
                    </div>
                </section>

                {/* ─── Bottom CTA ────────────────────────────────────────── */}
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6 text-center space-y-3">
                    <HelpCircle className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-bold text-lg">Still have questions?</h3>
                    <p className="text-sm text-muted-foreground">
                        Check our FAQs or tap the <strong>🎧 headphone button</strong> at the bottom-right of this page to speak with the EA team directly.
                    </p>
                    <button
                        onClick={() => navigate("/#faqs")}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <HelpCircle className="h-4 w-4" />
                        View FAQs
                    </button>
                </div>

            </main>
            <Footer />
        </div>
    );
}
