import { CreditCard } from "lucide-react";
import ComingSoonSection from "@/components/settings/ComingSoonSection";

export const metadata = { title: "Plan & Usage | NexusForge" };

export default function BillingSettingsPage() {
  return (
    <ComingSoonSection
      title="Plan & Usage"
      icon={CreditCard}
      description="You're currently on the Free plan. Billing and usage limits will show up here once NexusForge Pro launches."
      cta={{ label: "Join the Pro Waitlist", href: "/waitlist" }}
    />
  );
}
