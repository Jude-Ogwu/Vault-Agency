import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Vault Agency escrow work?",
    answer:
      "Vault Agency acts as a trusted middleman. When a buyer wants to purchase something, they pay into our secure escrow. We hold the funds while the seller delivers the product or service. Once the buyer confirms receipt and both parties provide proof, the admin reviews and releases the payment to the seller.",
  },
  {
    question: "Is my money safe with Vault Agency?",
    answer:
      "Absolutely! Your funds are securely held and never released until you confirm successful delivery. Our manual verification process ensures every transaction is reviewed by our team before any money changes hands.",
  },
  {
    question: "What types of transactions can I use Vault Agency for?",
    answer:
      "Vault Agency supports three types of transactions: Physical Products (electronics, vehicles, clothing), Digital Products (software, files, online courses), and Services (freelance work, repairs, consulting). Essentially, any transaction where you want protection from scams.",
  },
  {
    question: "What happens if the seller doesn't deliver?",
    answer:
      "If the seller fails to deliver as promised, you can raise a dispute. Our admin team will review the case, and if the seller is at fault, your funds will be returned to you. You never lose money for products or services you didn't receive.",
  },
  {
    question: "How long does it take to release funds?",
    answer:
      "Once the buyer confirms successful delivery and both parties upload proof, our admin team reviews the transaction. Fund release typically happens within 24-48 hours after admin approval.",
  },
  {
    question: "Does the seller need to have an account?",
    answer:
      "No! When a buyer creates a transaction, the seller receives a notification via email with all the transaction details. The seller can view their transactions by logging in with the email address used in the transaction.",
  },
  {
    question: "What proof do I need to upload?",
    answer:
      "Buyers should upload proof of delivery receipt (photos, screenshots of delivery confirmation, etc.). Sellers should upload proof of delivery/completion (shipping receipts, delivery photos, service completion screenshots). This protects both parties.",
  },
  {
    question: "Are there any fees for using Vault Agency?",
    answer:
      "Vault Agency charges a standard service fee of 5% for transactions under ₦10,000. For transactions of ₦10,000 and above, the fee is reduced to 2%. The exact fee is displayed before you confirm your payment.",
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
            Got questions? We've got answers. If you don't find what you're
            looking for, feel free to contact us.
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
