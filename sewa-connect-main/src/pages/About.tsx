import { Navbar } from "@/components/layout/Navbar";

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-serif font-bold text-foreground">About Sewa</h1>
                        <p className="text-xl text-muted-foreground">
                            Connecting compassionate hearts with causes that matter.
                        </p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg">
                            Sewa is a digital platform designed to bridge the gap between donors, volunteers, and non-profit organizations.
                            Our mission is to streamline social service by providing a unified directory of verified organizations across various sectors like
                            cow shelters (Gaushalas), old age homes, orphanages, and education foundations.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
                        <p>
                            To create a world where seeking help and offering help is seamless, transparent, and impactful.
                        </p>

                        <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Discover:</strong> Browse verified organizations by city or sector.</li>
                            <li><strong>Connect:</strong> Reach out directly via phone or email.</li>
                            <li><strong>Contribute:</strong> Donate or volunteer to support their cause.</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
