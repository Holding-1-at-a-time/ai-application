import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                            Ready to Transform Your Detailing Business?
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Join hundreds of detailing professionals who have streamlined their business with our AI-powered booking
                            system.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Link href="/register">
                            <Button size="lg">Get Started Today</Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline">
                                Talk to Sales
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

