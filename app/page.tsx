import { NavigationCard } from '@/components/navigation-card';
import { Syringe, FlaskConical, Factory, Award, Globe, GitCompare } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-[#d17728] text-white py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <p className="text-base sm:text-lg md:text-xl text-orange-100">Access, compare, and analyze detailed information about licensed vaccines, vaccine candidates, manufacturers, and regulatory authorities</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
          <NavigationCard
            title="Licensed Vaccines"
            description="Browse vaccines by pathogen, brandname, licenses, single and combination vaccines"
            href="/vaccines"
            icon={Syringe}
          />

          <NavigationCard
            title="Vaccine Candidates"
            description="Explore vaccines in development by pathogen and manufacturer"
            href="candidates"
            icon={FlaskConical}
          />

          <NavigationCard
            title="Manufacturers"
            description="Company information, product portfolios, vaccines, and licenses"
            href="manufacturers"
            icon={Factory}
          />

          <NavigationCard
            title="Licensing Authorities"
            description="Regulatory bodies, approved vaccines, and licensing information"
            href="authorities"
            icon={Award}
          />

          <NavigationCard
            title="NITAGs"
            description="National Immunization Technical Advisory Groups by country"
            href="nitags"
            icon={Globe}
          />

          <NavigationCard
            title="Comparison"
            description="Compare vaccines data and specifications based on pathogens"
            href="/compare"
            icon={GitCompare}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
