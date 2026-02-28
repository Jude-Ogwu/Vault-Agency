import { Users, ShieldCheck, Clock, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Happy Users",
  },
  {
    icon: ShieldCheck,
    value: "$500M+",
    label: "Secured Transactions",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Support Available",
  },
  {
    icon: Award,
    value: "99.9%",
    label: "Success Rate",
  },
];

export function TrustIndicators() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground md:text-3xl">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
