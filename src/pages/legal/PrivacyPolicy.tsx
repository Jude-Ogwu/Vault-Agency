import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-slate max-w-none dark:prose-invert space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p>
                            Escrow Nigeria ("EN", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our escrow services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and banking details that you voluntarily give to us when you register or choose to participate in a transaction.</li>
                            <li><strong>Transaction Data:</strong> Details about the transactions you carry out through our services, including product descriptions, prices, and messages exchanged with other users.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, operating system, and access times.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Use of Your Information</h2>
                        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Facilitate listing creation, management, and secure payments.</li>
                            <li>Verify your identity and prevent fraud.</li>
                            <li>Resolve disputes and troubleshoot problems.</li>
                            <li>Send you email notifications regarding your transactions and account security.</li>
                            <li>Request feedback and contact you about your use of the Site.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Disclosure of Your Information</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                        </p>
                        <p className="mt-2">
                            We may also release information when its release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Security of Your Information</h2>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Policy for Children</h2>
                        <p>
                            We do not knowingly solicit information from or market to children under the age of 18. If you become aware of any data we have collected from children under age 18, please contact us using the contact information provided below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at:<br />
                            <strong>Email:</strong> privacy@vaultagency.ng
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
