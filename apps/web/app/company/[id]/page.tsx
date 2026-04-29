'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompany, searchShareholders } from '@/lib/api';

interface Shareholder {
  id: string;
  name: string;
  shares: number;
  percentage: number;
}

interface Company {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyPage({ params }: PageProps) {
  const { id } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companyRes, shareholdersRes] = await Promise.all([
          getCompany(id),
          searchShareholders(id),
        ]);
        setCompany(companyRes.data.company);
        setShareholders(shareholdersRes.data.shareholders || []);
      } catch (error) {
        console.error('Failed to fetch company data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Search
      </Link>
      
      {/* Company Info */}
      <div className="mb-8">
        {company ? (
          <>
            <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
            <p className="text-xl text-gray-600">
              {company.ticker} • {company.exchange}
            </p>
          </>
        ) : (
          <p>Company not found</p>
        )}
      </div>

      {/* Shareholders List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Major Shareholders</h2>
        
        {shareholders.length > 0 ? (
          <div className="space-y-3">
            {shareholders.map((sh) => (
              <div
                key={sh.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium">{sh.name}</h3>
                  <p className="text-gray-600">{sh.shares.toLocaleString()} shares</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{sh.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No shareholders found</p>
        )}
      </div>
    </div>
  );
}