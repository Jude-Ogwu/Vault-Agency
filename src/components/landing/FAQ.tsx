import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  // ── General ────────────────────────────────────────────────────────────────
  {
    question: "How does Escrow Nigeria work?",
    answer:
      "Escrow Nigeria is a secure middleman for online transactions. The buyer deposits funds into our escrow. We hold the money safely while the seller delivers. Once both parties upload proof and the buyer confirms delivery, our team verifies and releases the funds to the seller. Nobody loses money — we protect both sides.",
  },
  {
    question: "What types of transactions can I use Escrow Nigeria for?",
    answer:
      "Three categories: (1) Physical Products — electronics, vehicles, clothing, furniture, etc. (2) Digital Products — software, files, accounts, online courses, designs. (3) Services — freelance work, repairs, consulting, coding, any skill-based task. Essentially any transaction between strangers where trust is needed.",
  },
  {
    question: "Is my money safe with Escrow Nigeria?",
    answer:
      "Yes. Funds are held in our secure escrow system and never transferred to the seller automatically. Every transaction is manually reviewed by our EN team before any money changes hands. Your funds are only released after both parties submit proof and EN approves.",
  },

  // ── Fees ───────────────────────────────────────────────────────────────────
  {
    question: "What are the EN service fees?",
    answer:
      "Escrow Nigeria charges a service fee that is always paid BY THE BUYER — it's added on top of the deal amount. For Naira (Bank Transfer) transactions below ₦10,000, the fee is 5%. For ₦10,000 and above, it drops to 1%. For Dollar (Crypto) transactions below $8, the fee is 5%. For $8 and above, it drops to 1%. The seller always receives exactly the agreed amount with nothing deducted.",
  },
  {
    question: "Does the seller pay any fees?",
    answer:
      "No. Sellers pay zero fees. The EN service fee is entirely the buyer's responsibility, added on top of the agreed deal amount. What you quote as a seller is what you receive in full.",
  },

  // ── Accounts & Identity ────────────────────────────────────────────────────
  {
    question: "Do both buyer and seller need an account?",
    answer:
      "Yes, both parties need an account to participate in a transaction. The seller can create a free account when they click the invite link — it only takes a minute. Accounts are free and required for security and identity verification purposes.",
  },
  {
    question: "What is my Unique ID and why does it matter?",
    answer:
      "Every user gets an 8-character Unique ID (e.g. 3E604106) based on their account UUID. This is a random, unfakeable identifier. Before accepting any deal, always verify your trading partner's ID matches what they told you on WhatsApp or Telegram. It prevents impersonation and identity fraud. Your email is never shown publicly — only your ID is.",
  },
  {
    question: "Where can I find my Unique ID?",
    answer:
      "On desktop: click your name/email in the top-right corner of the navbar — your ID appears in the dropdown. On mobile: open the menu (hamburger icon) → Settings. You can also find it in Account Settings (/settings) on any device. Use the copy button to share it easily.",
  },
  {
    question: "Can I change my email or password?",
    answer:
      "Yes, both can be changed in Settings (/settings). For email: enter your new email address and a confirmation link will be sent to the new address — the change only takes effect after you confirm it. For password: enter and confirm your new password (minimum 6 characters). Both changes trigger a security notification in your notification panel.",
  },

  // ── Transaction Flow ────────────────────────────────────────────────────────
  {
    question: "How does the buyer create a transaction?",
    answer:
      "Log in → go to your Buyer Dashboard → click 'New Transaction'. Enter the deal title, description, amount, and product type. Submit, and an invite link is automatically generated for your seller. Share that link with the seller via any platform (WhatsApp, Telegram, email, etc.).",
  },
  {
    question: "How does the seller accept a deal?",
    answer:
      "The seller clicks the invite link shared by the buyer, reviews the deal details (title, description, amount they'll receive, buyer's ID, EN fee breakdown), logs in or creates a free account, then clicks 'Accept Deal as Seller'. They'll be redirected to their Seller Dashboard to track the transaction.",
  },
  {
    question: "How long are invite links valid?",
    answer:
      "Invite links expire after 72 hours (3 days). If the seller doesn't accept within that time, ask the buyer to generate a new invite link from their transaction dashboard. Each link is also single-use — once accepted, it can't be used again.",
  },
  {
    question: "What happens after the seller accepts the invite?",
    answer:
      "The buyer receives a notification that the seller has joined. The transaction status changes to 'Seller Joined' and the buyer can now proceed to payment. The funds are held in escrow until both parties confirm delivery.",
  },

  // ── Payment ─────────────────────────────────────────────────────────────────
  {
    question: "What payment methods are supported?",
    answer:
      "Currently, Crypto payments (BTC, USDT, ETH) are available. Paystack (cards, bank transfer, USSD), Stripe (international cards), and PayPal are coming soon. For crypto: select your coin, copy the wallet address shown, send the exact amount, then upload your proof (screenshot + TX hash).",
  },
  {
    question: "What should I include when submitting crypto payment proof?",
    answer:
      "Include a clear screenshot of the successful send from your crypto wallet, plus the transaction hash (TX hash). The EN team needs the TX hash to verify on the blockchain. Incomplete proof will delay processing.",
  },

  // ── Delivery & Release ──────────────────────────────────────────────────────
  {
    question: "What proof do I need to upload?",
    answer:
      "Sellers should upload proof of delivery — shipping receipts, delivery photos, screenshots of digital files sent, or service completion evidence. Buyers should upload proof of receipt — photo of item received, screenshot confirming download or delivery. Both sides should upload strong, clear proof. It's used in case of disputes.",
  },
  {
    question: "How long does fund release take?",
    answer:
      "Once both parties upload proof and the buyer confirms delivery, EN reviews the transaction. Approval and fund release usually happens within 24–48 hours. Both parties are notified via the notification panel when funds are released.",
  },

  // ── Disputes ────────────────────────────────────────────────────────────────
  {
    question: "What happens if the seller doesn't deliver?",
    answer:
      "Open the transaction in your Buyer Dashboard and click 'File a Complaint'. Explain what happened clearly. EN reviews your complaint alongside both parties' proof. If the seller is indeed at fault, your funds are refunded in full. Your money never goes anywhere until EN approves.",
  },
  {
    question: "Can the seller file a complaint too?",
    answer:
      "Yes. If a buyer is making false claims or refuses to confirm delivery despite it being completed, the seller can also file a complaint from their Seller Dashboard. EN will investigate both sides fairly using the uploaded proof and chat history.",
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  {
    question: "How do notifications work?",
    answer:
      "The bell 🔔 icon in the navbar is your notification center. It shows realtime alerts for all important events: invite accepted, payment confirmed, delivery done, dispute filed, funds released, profile updated, and more. Unread notifications show a red dot. You can mark individual notifications as read or clear them all.",
  },

  // ── Support ──────────────────────────────────────────────────────────────────
  {
    question: "How do I get help or contact support?",
    answer:
      "Look for the green headphone 🎧 button fixed at the bottom-right corner of every page on Escrow Nigeria. Click it anytime to chat with the EN support team. It's available to all users — even before you sign up. You can also visit the How It Works page from the navbar for a full platform guide.",
  },
  {
    question: "Can my account get suspended?",
    answer:
      "Yes. Accounts can be suspended for filing false complaints, attempting fraud, abusing the platform, or violating our terms of service. If your account is suspended and you believe it's an error, contact EN support using the headphone button and our team will review your case.",
  },
];

export function FAQ() {
  return (
    <section id="faqs" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Got questions? We've got answers. Can't find what you're looking for?{" "}
            <span className="font-medium text-foreground">
              Tap the 🎧 button at the bottom-right of any page to reach our support team.
            </span>
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
