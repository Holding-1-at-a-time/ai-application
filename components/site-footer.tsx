import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t bg-background">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">AutoDetail Pro</h3>
                        <p className="text-sm text-muted-foreground">
                            Professional automotive detailing booking system with AI capabilities.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/documentation" className="text-muted-foreground hover:text-foreground">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                                    Guides
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                                    Cookies
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} AutoDetail Pro. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

