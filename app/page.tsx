import { NavigationCard } from '@/components/navigation-card';
import { Syringe, FlaskConical, Factory, Award, Globe, GitCompare } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <p className="text-xl mb-4 text-orange-100">Welcome to</p>
            <h1 className="text-6xl font-bold mb-6">VacciPROFILE</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <NavigationCard
            title="Licensed Vaccines"
            description="Browse vaccines by pathogen, brandname, licenses, single and combination vaccines"
            href="/vaccines"
            icon={Syringe}
          />

          <NavigationCard
            title="Vaccine Candidates"
            description="Explore vaccines in development by pathogen and manufacturer"
            href="/candidates"
            icon={FlaskConical}
          />

          <NavigationCard
            title="Manufacturers"
            description="Company information, product portfolios, vaccines, and licenses"
            href="/manufacturers"
            icon={Factory}
          />

          <NavigationCard
            title="Licensing Authorities"
            description="Regulatory bodies, approved vaccines, and licensing information"
            href="/authorities"
            icon={Award}
          />

          <NavigationCard
            title="NITAGs"
            description="National Immunization Technical Advisory Groups recommendations"
            href="/nitags"
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
