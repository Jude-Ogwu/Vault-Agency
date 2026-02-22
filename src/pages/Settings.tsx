import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    User, Mail, Phone, Lock, Copy, Check,
    Shield, ArrowLeft, Loader2, Save
} from "lucide-react";

// ─── Helper: insert a notification for the user ────────────────────────────────
async function pushNotification(
    userId: string,
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "success",
    link?: string
) {
    await (supabase.from("notifications") as any).insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        read: false,
    });
}

export default function Settings() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Profile fields
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Email
    const [newEmail, setNewEmail] = useState("");
    const [savingEmail, setSavingEmail] = useState(false);

    // Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    // Copy ID
    const [copiedId, setCopiedId] = useState(false);

    const userShortId = user ? user.id.slice(0, 8).toUpperCase() : "";

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            setPhone(profile.phone || "");
        }
        if (user) {
            setNewEmail(user.email || "");
        }
    }, [profile, user]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) navigate("/login?redirect=/settings");
    }, [authLoading, user, navigate]);

    const handleCopyId = () => {
        navigator.clipboard.writeText(userShortId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    // ─── Save Profile (name + phone) ──────────────────────────────────────────
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSavingProfile(true);

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName.trim(), phone: phone.trim() })
            .eq("id", user.id);

        if (error) {
            toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Profile updated", description: "Your name and phone have been saved." });
            await pushNotification(
                user.id,
                "Profile Updated",
                "Your full name and phone number were updated successfully.",
                "success",
                "/settings"
            );
        }
        setSavingProfile(false);
    };

    // ─── Change Email ──────────────────────────────────────────────────────────
    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (newEmail.trim() === user.email) {
            toast({ title: "No change", description: "That's already your current email." });
            return;
        }
        setSavingEmail(true);

        const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });

        if (error) {
            toast({ title: "Email update failed", description: error.message, variant: "destructive" });
        } else {
            // Also update profiles table
            await supabase.from("profiles").update({ email: newEmail.trim() }).eq("id", user.id);
            toast({
                title: "Confirm your new email",
                description: `A confirmation link has been sent to ${newEmail}. Check your inbox.`,
            });
            await pushNotification(
                user.id,
                "Email Change Requested",
                `A confirmation link was sent to ${newEmail}. Click it to complete the change.`,
                "info",
                "/settings"
            );
        }
        setSavingEmail(false);
    };

    // ─── Change Password ───────────────────────────────────────────────────────
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword.length < 6) {
            toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords don't match", description: "Please make sure both passwords match.", variant: "destructive" });
            return;
        }

        setSavingPassword(true);

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast({ title: "Password update failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Password changed", description: "Your password has been updated successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            await pushNotification(
                user.id,
                "Password Changed",
                "Your account password was successfully updated. If you didn't do this, contact support immediately.",
                "warning",
                "/settings"
            );
        }
        setSavingPassword(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full space-y-6">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your account details and security.</p>
                </div>

                {/* ── Your Unique ID ────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-4 w-4 text-primary" />
                            Your Unique ID
                        </CardTitle>
                        <CardDescription>Share this ID with your trading partners so they can verify it's you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                            <span className="font-mono font-bold tracking-widest text-xl flex-1">{userShortId}</span>
                            <button
                                onClick={handleCopyId}
                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {copiedId
                                    ? <><Check className="h-4 w-4 text-success" /> Copied!</>
                                    : <><Copy className="h-4 w-4" /> Copy</>}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Profile ───────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 text-primary" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>Update your full name and phone number.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+234 800 000 0000"
                                />
                            </div>
                            <div className="pt-1">
                                <Label className="text-muted-foreground text-xs">Registered Email (read-only here)</Label>
                                <div className="mt-1 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    {user?.email}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">To change your email, use the section below.</p>
                            </div>
                            <Button type="submit" disabled={savingProfile} className="w-full sm:w-auto">
                                {savingProfile
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                    : <><Save className="mr-2 h-4 w-4" /> Save Profile</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ── Change Email ──────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Mail className="h-4 w-4 text-primary" />
                            Change Email
                        </CardTitle>
                        <CardDescription>
                            A confirmation link will be sent to your new email. The change only takes effect after you confirm it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangeEmail} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newEmail">New Email Address</Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={savingEmail} className="w-full sm:w-auto">
                                {savingEmail
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</>
                                    : <><Mail className="mr-2 h-4 w-4" /> Update Email</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ── Change Password ───────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Lock className="h-4 w-4 text-primary" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Choose a strong password of at least 6 characters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <PasswordInput
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={savingPassword}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                {savingPassword
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                                    : <><Lock className="mr-2 h-4 w-4" /> Change Password</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                {/* ── Danger Zone ─────────────────────────────────── */}
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <h3 className="text-sm font-semibold text-destructive mb-1">Account</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Need help with your account? Contact Escrow Africa support through the help widget below.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Account ID: <span className="font-mono text-foreground">{user?.id}</span>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
