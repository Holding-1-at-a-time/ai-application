"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useAuth } from '@clerk/nextjs';


export function SiteHeader() {
    const { user, isLoading } =  // `use client` required for app router
  
  const { isLoaded, userId, sessionId, getToken } = useAuth();

    // In case the user signs out while on the page.
    if (!isLoaded || !userId) {
        return null;
    } ()

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            role="banner"
        >
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2" aria-label="AutoDetail Pro home">
                        <span className="font-bold text-xl">AutoDetail Pro</span>
                    </Link>
                    <nav className="hidden md:flex gap-6" aria-label="Main navigation">
                        <Link
                            href="/features"
                            className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Features
                        </Link>
                        <Link
                            href="/pricing"
                            className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {!isLoading && !user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button
                                    size="sm"
                                    className="shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <UserNav />
                    )}
                </div>
            </div>
        </header>
    )
}