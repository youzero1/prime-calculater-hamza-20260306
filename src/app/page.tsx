'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfitMarginCalculator from '@/components/ProfitMarginCalculator';
import TaxCalculator from '@/components/TaxCalculator';
import DiscountCalculator from '@/components/DiscountCalculator';
import ShippingCostCalculator from '@/components/ShippingCostCalculator';
import CalculationHistory from '@/components/CalculationHistory';

const tabs = [
  { id: 'margin', label: '📈 Profit Margin', shortLabel: 'Margin' },
  { id: 'tax', label: '🧾 Tax', shortLabel: 'Tax' },
  { id: 'discount', label: '🏷️ Discount', shortLabel: 'Discount' },
  { id: 'shipping', label: '📦 Shipping', shortLabel: 'Shipping' },
  { id: 'history', label: '🕓 History', shortLabel: 'History' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('margin');
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleSaved = () => {
    setHistoryRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Tab Bar */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'margin' && (
            <ProfitMarginCalculator onSaved={handleSaved} />
          )}
          {activeTab === 'tax' && (
            <TaxCalculator onSaved={handleSaved} />
          )}
          {activeTab === 'discount' && (
            <DiscountCalculator onSaved={handleSaved} />
          )}
          {activeTab === 'shipping' && (
            <ShippingCostCalculator onSaved={handleSaved} />
          )}
          {activeTab === 'history' && (
            <CalculationHistory refresh={historyRefresh} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
