import { Heart, Shield, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Organizations',
    description: 'Every organization on Sewa goes through a verification process to ensure authenticity and trustworthiness.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a community of donors, volunteers, and organizations working together for social good.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Impact',
    description: 'See how your contributions make a real difference in the lives of those who need it most.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About Sewa
          </div>
          
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-6">
            Connecting Hearts with Causes That Matter
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sewa is a platform dedicated to bridging the gap between generous donors and verified non-profit organizations. 
            Our mission is to make giving easier, more transparent, and more impactful. Whether you want to support 
            education, healthcare, animal welfare, or elderly care, Sewa connects you with organizations that share your values.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
