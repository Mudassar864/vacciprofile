import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex justify-center items-center gap-4 text-sm mb-3 flex-wrap">
          <Link href="#" className="hover:text-orange-400">Terms & Conditions</Link>
          <span>|</span>
          <Link href="#" className="hover:text-orange-400">Privacy Policy</Link>
          <span>|</span>
          <Link href="#" className="hover:text-orange-400">Disclaimer</Link>
          <span>|</span>
          <Link href="#" className="hover:text-orange-400">Imprint</Link>
          <span>|</span>
          <Link href="#" className="hover:text-orange-400">Contacts</Link>
          <span>|</span>
          <Link href="#" className="hover:text-orange-400">LinkedIn</Link>
        </div>
        <div className="text-center text-sm">
          <p className="mb-1">Copyright © 2009-2025 Global Health Press Pte Ltd. Reg. No. 200921795N All Rights Reserved.</p>
          <p>
            Subject to <Link href="#" className="text-blue-400 hover:underline">Creative Commons Licence (cc)</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
