import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                AI-Powered Automotive Detailing Booking
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Streamline your automotive detailing business with our intelligent booking system. Powered by AI to
                                enhance customer experience and optimize your schedule.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/register">
                                <Button size="lg">Get Started</Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline">
                                    Book a Demo
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-muted">
                            <Image
                                src="/images/hero-image.jpg"
                                alt="Automotive detailing professional working on a luxury car"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                                priority
                                className="object-cover"
                                placeholder="blur"
                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg=="
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

