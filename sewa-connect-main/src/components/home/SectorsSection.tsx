import { Link } from 'react-router-dom';
import { OrganizationSector, SECTOR_LABELS, SECTOR_ICONS } from '@/types/organization';
import { ArrowRight } from 'lucide-react';

const sectors: OrganizationSector[] = [
  'old_age_home',
  'cow_shelter',
  'orphanage',
  'animal_care',
  'education',
  'medical_aid',
];

const sectorColors: Record<OrganizationSector, string> = {
  old_age_home: 'from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30',
  cow_shelter: 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30',
  orphanage: 'from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30',
  animal_care: 'from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30',
  education: 'from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30',
  medical_aid: 'from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30',
  other: 'from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30',
};

export function SectorsSection() {
  return (
    <section id="sectors" className="py-10 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
            Sectors We Serve
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore organizations across various sectors dedicated to making a positive impact in society.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {sectors.map((sector) => (
            <Link
              key={sector}
              to={`/organizations?sector=${sector}`}
              className={`group relative bg-gradient-to-br ${sectorColors[sector]} rounded-2xl p-6 text-center transition-all duration-300 border border-border hover:border-primary/30 hover:shadow-card`}
            >
              <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {SECTOR_ICONS[sector]}
              </div>
              <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight">
                {SECTOR_LABELS[sector]}
              </h3>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 absolute bottom-4 right-4 transition-opacity" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/organizations"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            View All Organizations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
