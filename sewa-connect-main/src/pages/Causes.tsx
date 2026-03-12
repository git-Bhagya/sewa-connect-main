import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Stethoscope, GraduationCap, Sprout, Utensils, PawPrint } from "lucide-react";

const causes = [
    {
        title: "Food & Hunger",
        description: "Provide nutritious meals to the hungry and fight malnutrition.",
        icon: Utensils,
        color: "text-orange-500",
        bg: "bg-orange-50",
        link: "/organizations?sector=old_age_home", // Mapping to old age/orphanage as proxy
    },
    {
        title: "Medical Aid",
        description: "Support medical treatments, surgeries, and health camps for the needy.",
        icon: Stethoscope,
        color: "text-red-500",
        bg: "bg-red-50",
        link: "/organizations?sector=medical_aid",
    },
    {
        title: "Education",
        description: "Sponsor education for underprivileged children and build a brighter future.",
        icon: GraduationCap,
        color: "text-blue-500",
        bg: "bg-blue-50",
        link: "/organizations?sector=education",
    },
    {
        title: "Animal Welfare",
        description: "Protect stray animals and support cow shelters (Gaushalas).",
        icon: PawPrint, // Using PawPrint as proxy for animals
        color: "text-amber-700",
        bg: "bg-amber-50",
        link: "/organizations?sector=animal_care",
    },
    {
        title: "Nature & Environment",
        description: "Plant trees, clean water bodies, and protect our environment.",
        icon: Sprout,
        color: "text-green-600",
        bg: "bg-green-50",
        link: "/organizations?sector=other", // Mapping to other for now
    },
    {
        title: "Elderly Care",
        description: "Provide shelter, food, and companionship to abandoned seniors.",
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-50",
        link: "/organizations?sector=old_age_home",
    },
];

export default function Causes() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                            Causes We Support
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Explore the various causes that our partner organizations are working towards.
                            Choose a cause close to your heart and make a difference today.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {causes.map((cause, index) => (
                            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-full ${cause.bg} flex items-center justify-center mb-4`}>
                                        <cause.icon className={`w-6 h-6 ${cause.color}`} />
                                    </div>
                                    <CardTitle className="text-xl font-serif">{cause.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base mb-6">
                                        {cause.description}
                                    </CardDescription>
                                    <Button asChild className="w-full" variant="outline">
                                        <Link to={cause.link}>Explore Organizations</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
