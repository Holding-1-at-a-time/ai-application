import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PricingSection() {
    const plans = [
        {
            name: "Starter",
            price: "$49",
            description: "Perfect for small detailing businesses just getting started",
            features: [
                "AI Booking Assistant",
                "Calendar Management",
                "Customer Database",
                "Email Notifications",
                "Basic Analytics",
                "1 Business Location",
            ],
            cta: "Get Started",
            popular: false,
        },
        {
            name: "Professional",
            price: "$99",
            description: "Ideal for growing detailing businesses with multiple staff",
            features: [
                "Everything in Starter",
                "Advanced AI Assistant",
                "Staff Management",
                "SMS Notifications",
                "Detailed Analytics",
                "3 Business Locations",
                "Custom Services",
            ],
            cta: "Get Started",
            popular: true,
        },
        {
            name: "Enterprise",
            price: "$199",
            description: "For established detailing businesses with multiple locations",
            features: [
                "Everything in Professional",
                "Premium AI Assistant",
                "White-label Solution",
                "API Access",
                "Priority Support",
                "Unlimited Locations",
                "Custom Integrations",
            ],
            cta: "Contact Sales",
            popular: false,
        },
    ]

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Choose the plan that&apos;s right for your detailing business
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`flex flex-col rounded-lg border bg-background p-6 ${plan.popular ? "border-primary shadow-lg" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground mb-4 self-start">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="ml-1 text-muted-foreground">/month</span>
                            </div>
                            <p className="mt-2 text-muted-foreground">{plan.description}</p>
                            <ul className="mt-6 space-y-3">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <Check className="h-4 w-4 text-primary mr-2" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto pt-6">
                                <Link href="/register">
                                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

