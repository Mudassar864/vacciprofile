import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 sm:py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-center items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-3 flex-wrap">
          <Link href="#" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:text-orange-400 transition-colors">Disclaimer</Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:text-orange-400 transition-colors">Imprint</Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:text-orange-400 transition-colors">Contacts</Link>
          <span className="hidden sm:inline">|</span>
          <Link href="#" className="hover:text-orange-400 transition-colors">LinkedIn</Link>
        </div>
        <div className="text-center text-xs sm:text-sm">
          <p className="mb-1">Copyright © 2009-2025 Global Health Press Pte Ltd. Reg. No. 200921795N All Rights Reserved.</p>
          <p>
            Subject to <Link href="#" className="text-blue-400 hover:underline">Creative Commons Licence (cc)</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
