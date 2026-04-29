'use client';

import { useState } from 'react';
import Link from 'next/link';
import { searchAll } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await searchAll(query);
      setResults(data.companies || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">StockHolder Finder</h1>
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by company name, stock code, or shareholder..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 border rounded-lg shadow-sm"
        />
      </form>
      
      {loading && <p className="text-center">Loading...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {results.map((company) => (
          <Link
            key={company.id}
            href={`/company/${company.id}`}
            className="p-4 border rounded-lg hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <p className="text-gray-600">{company.ticker} • {company.exchange}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}