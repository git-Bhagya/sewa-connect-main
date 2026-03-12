import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Stethoscope, GraduationCap, Sprout, Utensils, PawPrint } from "lucide-react";

const causes = [
    {
        title: "Food & Hunger",
        description: "Provide nutritious meals to the hungry and fight malnutrition.",
        icon: Utensils,
        color: "text-orange-500",
        bg: "bg-orange-50",
        link: "/organizations?sector=old_age_home",
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
];

export function CausesSection() {
    return (
        <section className="py-10 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                        Causes We Support
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Explore the various causes that our partner organizations are working towards.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
                                    <Link to={cause.link}>Explore</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Button asChild size="lg">
                        <Link to="/causes">View All Causes</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
