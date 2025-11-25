import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary';
}

export function NavigationCard({ title, description, href, icon: Icon, variant = 'default' }: NavigationCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        variant === 'primary'
          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600'
          : 'bg-white hover:border-orange-200'
      }`}>
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 rounded-full p-6 w-24 h-24 flex items-center justify-center border-4 ${
            variant === 'primary'
              ? 'bg-white border-white'
              : 'bg-white border-orange-500'
          }`}>
            <Icon className={`w-12 h-12 ${variant === 'primary' ? 'text-[#d17728]' : 'text-[#d17728]'}`} />
          </div>
          <CardTitle className={`text-2xl font-bold ${variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className={`text-base leading-relaxed ${variant === 'primary' ? 'text-white' : 'text-gray-600'}`}>
            {description}
          </CardDescription>
          <p className={`mt-4 font-medium ${variant === 'primary' ? 'text-white' : 'text-[#d17728]'} group-hover:underline`}>
            View more
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
