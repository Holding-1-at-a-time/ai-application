import { Calendar, MessageSquare, Clock, Shield, BarChart, Users } from "lucide-react"

export function FeaturesSection() {
    const features = [
        {
            icon: <Calendar className="h-6 w-6" />,
            title: "Smart Booking Calendar",
            description: "AI-optimized scheduling that maximizes your business efficiency and customer satisfaction.",
        },
        {
            icon: <MessageSquare className="h-6 w-6" />,
            title: "AI Assistant",
            description: "Intelligent virtual assistant that handles customer inquiries and booking requests 24/7.",
        },
        {
            icon: <Clock className="h-6 w-6" />,
            title: "Real-time Availability",
            description: "Show real-time availability to customers and prevent double bookings automatically.",
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Secure & Private",
            description: "Enterprise-grade security with multi-tenant architecture to keep your data safe.",
        },
        {
            icon: <BarChart className="h-6 w-6" />,
            title: "Business Analytics",
            description: "Comprehensive analytics dashboard to track performance and identify growth opportunities.",
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Customer Management",
            description: "Maintain detailed customer profiles and service history for personalized experiences.",
        },
    ]

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                            Powerful Features for Your Detailing Business
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Everything you need to manage and grow your automotive detailing business
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-4 bg-background">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">{feature.icon}</div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-center text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

