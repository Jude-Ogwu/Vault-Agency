import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingBag, Tag, TrendingUp, Shield } from "lucide-react";

export default function Marketplace() {
    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl gradient-hero shadow-lg">
                                <Store className="h-12 w-12 text-primary-foreground" />
                            </div>
                            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 text-sm font-semibold">
                                Coming Soon
                            </Badge>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-3 md:text-4xl">
                        Escrow Africa Marketplace
                    </h1>
                    <p className="text-lg text-muted-foreground mb-12">
                        A secure marketplace where buyers and sellers can trade with escrow protection built-in.
                    </p>

                    {/* Features Preview */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="text-left">
                            <CardContent className="flex items-start gap-4 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">List Products</h3>
                                    <p className="text-sm text-muted-foreground">Sell physical goods, digital products, and services securely.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="text-left">
                            <CardContent className="flex items-start gap-4 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 shrink-0">
                                    <Shield className="h-5 w-5 text-success" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Escrow Protected</h3>
                                    <p className="text-sm text-muted-foreground">Every transaction secured by Escrow Africa escrow.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="text-left">
                            <CardContent className="flex items-start gap-4 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                                    <Tag className="h-5 w-5 text-warning" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Competitive Pricing</h3>
                                    <p className="text-sm text-muted-foreground">Low fees, transparent pricing, no hidden charges.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="text-left">
                            <CardContent className="flex items-start gap-4 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                                    <TrendingUp className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Seller Analytics</h3>
                                    <p className="text-sm text-muted-foreground">Track your performance with real-time analytics.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <p className="text-sm text-muted-foreground mt-12">
                        We're building something amazing. Stay tuned! 🚀
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
