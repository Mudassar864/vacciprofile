'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlphabetNav } from '@/components/alphabet-nav';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface Manufacturer {
  manufacturer_id: number;
  name: string;
  headquarters: string;
  website: string;
  founded: string;
  ceo: string;
}

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterManufacturers();
  }, [manufacturers, selectedLetter, searchQuery, activeLetter]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .order('name');

    if (!error && data) {
      setManufacturers(data as Manufacturer[]);
    }
    setLoading(false);
  }

  function filterManufacturers() {
    let filtered = manufacturers;

    const effectiveLetter = activeLetter || selectedLetter;
    if (effectiveLetter) {
      filtered = filtered.filter(m => m.name.charAt(0).toUpperCase() === effectiveLetter);
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.headquarters && m.headquarters.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredManufacturers(filtered);
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const manufacturersGroupedByLetter = alphabet.map(letter => ({
    letter,
    manufacturers: manufacturers.filter(m => m.name.charAt(0).toUpperCase() === letter)
  })).filter(group => group.manufacturers.length > 0);

  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter === activeLetter ? '' : letter);
    setSelectedLetter('');
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <AlphabetNav onLetterClick={handleLetterClick} activeLetter={activeLetter} />

      <div className="flex">
        <aside className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-180px)] overflow-y-auto sticky top-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading manufacturers...</div>
          ) : (
            <>
              {manufacturersGroupedByLetter.map(group => (
                <div key={group.letter}>
                  <button
                    onClick={() => setSelectedLetter(group.letter === selectedLetter ? '' : group.letter)}
                    className={`w-full text-left px-4 py-2 border-b border-gray-200 font-semibold transition-colors ${
                      selectedLetter === group.letter
                        ? 'bg-[#d17728] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    {group.letter} ({group.manufacturers.length})
                  </button>
                  {selectedLetter === group.letter && (
                    <div className="bg-gray-50">
                      {group.manufacturers.map(manufacturer => (
                        <Link
                          key={manufacturer.manufacturer_id}
                          href={`/manufacturers/${manufacturer.manufacturer_id}`}
                          className="block px-6 py-2 text-sm hover:bg-orange-100 transition-colors text-gray-700 hover:text-[#d17728]"
                        >
                          {manufacturer.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {manufacturersGroupedByLetter.length === 0 && (
                <div className="p-4 text-center text-gray-500">No manufacturers found</div>
              )}
            </>
          )}
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-6xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-[#d17728] text-white px-6 py-4">
                <h2 className="text-xl font-bold">Vaccine Manufacturers</h2>
                <p className="text-sm text-orange-100 mt-1">
                  {filteredManufacturers.length} manufacturer{filteredManufacturers.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredManufacturers.length > 0 ? (
                  filteredManufacturers.map((manufacturer) => (
                    <Link
                      key={manufacturer.manufacturer_id}
                      href={`/manufacturers/${manufacturer.manufacturer_id}`}
                      className="block px-6 py-4 hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-[#d17728]">
                          {manufacturer.name}
                        </h3>
                        <span className="text-[#d17728]">&rarr;</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {manufacturer.headquarters && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Headquarters:</span> {manufacturer.headquarters}
                          </p>
                        )}
                        {manufacturer.founded && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Founded:</span> {manufacturer.founded}
                          </p>
                        )}
                        {manufacturer.ceo && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">CEO:</span> {manufacturer.ceo}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    No manufacturers found matching your criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
