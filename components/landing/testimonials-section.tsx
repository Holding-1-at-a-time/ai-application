import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function TestimonialsSection() {
    const testimonials = [
        {
            name: "Alex Johnson",
            role: "Owner, Pristine Auto Spa",
            content:
                "This booking system has transformed our business. The AI assistant handles most customer inquiries, freeing up our staff to focus on detailing. Our bookings have increased by 35% since implementation.",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            name: "Sarah Williams",
            role: "Manager, Elite Detailing",
            content:
                "The calendar system is intuitive and the AI recommendations for scheduling have optimized our workflow. We're able to fit in more appointments without feeling rushed or overbooked.",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        {
            name: "Michael Chen",
            role: "Founder, Shine Supreme",
            content:
                "Customer feedback has been overwhelmingly positive. They love the ease of booking and the AI chat feature that answers their questions instantly. The system has paid for itself many times over.",
            avatar: "/placeholder.svg?height=40&width=40",
        },
    ]

    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                            Trusted by Detailing Professionals
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            See what our customers have to say about our AI-powered booking system
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border bg-background">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-medium">{testimonial.name}</h3>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{testimonial.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

