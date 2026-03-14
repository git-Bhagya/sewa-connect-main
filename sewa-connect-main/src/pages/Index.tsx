import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/home/HeroSlider';
import { AboutSection } from '@/components/home/AboutSection';
import { SectorsSection } from '@/components/home/SectorsSection';
import { CausesSection } from '@/components/home/CausesSection';
import { DonationCard } from '@/components/home/DonationCard';
import { usePlatformStats } from '@/hooks/usePlatformStats';

const Index = () => {
  const { stats, refresh } = usePlatformStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <HeroSlider />
        <SectorsSection />
        <CausesSection />
        <AboutSection />

        {/* Mobile-only Donation Section at the bottom */}
        <section className="bg-slate-50 dark:bg-black py-12 px-4 lg:hidden border-t border-slate-200 dark:border-border">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Support Our Platform</h2>
              <p className="text-muted-foreground">Your contributions help us maintain and grow this community of kindness.</p>
            </div>
            <DonationCard stats={stats} onSuccess={refresh} className="max-w-md mx-auto" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
