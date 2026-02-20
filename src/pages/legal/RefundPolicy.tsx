import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
                <p className="text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate max-w-none dark:prose-invert space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
                        <p>
                            At Escrow Africa ("EA"), we prioritize the safety of your funds. Our Refund Policy implies that funds are held securely until the transaction is successfully completed. Refunds are issued in specific scenarios as outlined below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Eligibility for Refund</h2>
                        <p>Buyers are eligible for a refund in the following cases:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Item Not Received:</strong> The seller fails to deliver the goods or services within the agreed timeframe.</li>
                            <li><strong>Significantly Not as Described:</strong> The item received is significantly different from the seller's description (e.g., wrong model, damaged, missing parts).</li>
                            <li><strong>Mutual Agreement:</strong> Both the buyer and seller agree to cancel the transaction.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Refund Process</h2>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li><strong>Request:</strong> The buyer must initiate a dispute/refund request through their dashboard.</li>
                            <li><strong>Review:</strong> EA Admin reviews the request and may ask for evidence from both parties (photos, tracking, chat history).</li>
                            <li><strong>Decision:</strong> If the claim is valid, the transaction is cancelled, and funds are returned to the buyer.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Non-Refundable Fees</h2>
                        <p>
                            Escrow Africa service fees (2% or 5%) are generally non-refundable if the transaction is cancelled due to reasons beyond our control (e.g., buyer remorse), as these cover the cost of payment processing and platform maintenance. However, if a cancellation is due to seller fraud or platform error, the full amount including fees may be refunded at our discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Timeframe</h2>
                        <p>
                            Once a refund is approved, it is processed immediately from our system. However, depending on your bank or payment method, it may take <strong>1-5 business days</strong> for the funds to appear in your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Chargebacks</h2>
                        <p>
                            Initiating a chargeback with your bank without first contacting Escrow Africa to resolve the issue is a violation of our Terms of Service. This may result in the permanent suspension of your account and legal action to recover disputed funds.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
