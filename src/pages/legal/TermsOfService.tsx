import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function TermsOfService() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate max-w-none dark:prose-invert space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p>
                            Welcome to <strong>Escrow Africa ("EA")</strong>. By accessing our website and using our escrow services, you agree to comply with and be bound by the following terms and conditions. If you do not agree to these terms, you should not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p>
                            Escrow Africa provides a secure third-party escrow service to facilitate transactions between buyers and sellers. We hold funds in trust until the agreed-upon conditions of the transaction are met. We act solely as a neutral facilitator and are not a party to the actual transaction between buyers and sellers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                        <p>
                            To use our services, you must register an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Transaction Process</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Initiation:</strong> A transaction is created by the buyer or seller, detailing the item/service, price, and terms.</li>
                            <li><strong>Payment:</strong> The buyer deposits the agreed funds into the Escrow Africa secure escrow account.</li>
                            <li><strong>Verification:</strong> Escrow Africa notifies the seller that funds are secured. The seller then delivers the product or service.</li>
                            <li><strong>Release:</strong> Upon buyer confirmation of receipt and satisfaction (or verification by EA), funds are released to the seller, less applicable fees.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Fees and Payments</h2>
                        <p>
                            Escrow Africa charges a service fee for each transaction.
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Transactions under ₦10,000: <strong>5% fee</strong></li>
                            <li>Transactions ₦10,000 and above: <strong>2% fee</strong></li>
                        </ul>
                        <p className="mt-2">
                            Fees are deducted from the total amount released to the seller unless otherwise agreed. All fees are non-refundable once the service has been initiated.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Dispute Resolution</h2>
                        <p>
                            In the event of a dispute, Escrow Africa (EA) acts as the final arbitrator. Both parties agree to submit relevant evidence (photos, tracking numbers, chat logs) within 48 hours of a dispute claim. EA's decision is binding and final. We reserve the right to refund the buyer or release funds to the seller based on the evidence provided.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Prohibited Items and Activities</h2>
                        <p>
                            You may not use Escrow Africa for illegal transactions, including but not limited to: drugs, weapons, stolen goods, fraud, money laundering, or any items prohibited by applicable African and international law. Violation of this policy will result in immediate account suspension and reporting to relevant authorities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, Escrow Africa shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. We will provide notice of these changes by updating the "Last Updated" date at the top of these terms. Your continued use of our services confirms your acceptance of these changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
                        <p>
                            For any questions regarding these Terms, please contact us at: <br />
                            <strong>Email:</strong> support@escrowafrica.ng <br />
                            <strong>Phone:</strong> +234 814 491 9893
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
