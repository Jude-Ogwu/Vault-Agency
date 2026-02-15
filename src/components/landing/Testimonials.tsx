import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Adebayo Johnson",
    role: "Online Seller",
    content:
      "Vault Agency has transformed how I do business online. My customers trust me more because they know their money is protected. Sales have increased by 40%!",
    rating: 5,
  },
  {
    name: "Chidinma Okafor",
    role: "Buyer",
    content:
      "I was scammed twice before I found Vault Agency. Now I only buy through escrow. It's the peace of mind I needed for online shopping.",
    rating: 5,
  },
  {
    name: "Emmanuel Nwachukwu",
    role: "Freelancer",
    content:
      "As a freelancer, getting paid was always stressful. With Vault Agency, clients pay upfront and I know the money is secured. No more chasing payments!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground">
            Join thousands of users worldwide who trust Vault Agency for secure
            transactions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-0 bg-card shadow-escrow-md hover:shadow-escrow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="mb-4 text-muted-foreground">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
