'use client';

import { useState, useEffect } from 'react';
import { TaxInput, TaxResult } from '@/types';

interface Props {
  onSaved: () => void;
}

const COMMON_TAX_RATES = [5, 8, 10, 12, 15, 18, 20, 25];

export default function TaxCalculator({ onSaved }: Props) {
  const [input, setInput] = useState<TaxInput>({ price: 100, taxRate: 20, priceIncludesTax: false });
  const [result, setResult] = useState<TaxResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (input.price > 0 && input.taxRate >= 0) {
      let priceExcludingTax: number;
      let priceIncludingTax: number;
      let taxAmount: number;
      if (input.priceIncludesTax) {
        priceExcludingTax = input.price / (1 + input.taxRate / 100);
        taxAmount = input.price - priceExcludingTax;
        priceIncludingTax = input.price;
      } else {
        priceExcludingTax = input.price;
        taxAmount = input.price * (input.taxRate / 100);
        priceIncludingTax = input.price + taxAmount;
      }
      setResult({
        originalPrice: input.price,
        taxRate: input.taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        priceExcludingTax: Math.round(priceExcludingTax * 100) / 100,
        priceIncludingTax: Math.round(priceIncludingTax * 100) / 100,
      });
    } else {
      setResult(null);
    }
  }, [input]);

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tax', input, save: true }),
      });
      if (res.ok) {
        setSaved(true);
        onSaved();
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="section-title">🧾 Tax Calculator</h2>
        <p className="text-sm text-gray-400 mb-5">Calculate tax-inclusive and tax-exclusive prices.</p>

        <div className="space-y-4">
          <div>
            <label className="label">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              value={input.price}
              onChange={(e) => setInput((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <label className="label">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input-field"
              value={input.taxRate}
              onChange={(e) => setInput((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_TAX_RATES.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setInput((prev) => ({ ...prev, taxRate: rate }))}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                    input.taxRate === rate
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={() => setInput((prev) => ({ ...prev, priceIncludesTax: false }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !input.priceIncludesTax ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Excl. Tax
            </button>
            <button
              onClick={() => setInput((prev) => ({ ...prev, priceIncludesTax: true }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                input.priceIncludesTax ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Incl. Tax
            </button>
          </div>
        </div>

        {result && (
          <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 w-full">
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save to History'}
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Results</h2>
        {result ? (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Tax Amount</p>
                <p className="text-4xl font-bold text-yellow-700">${result.taxAmount.toFixed(2)}</p>
              </div>
              <div className="space-y-2.5">
                <div className="result-row">
                  <span className="result-label">Original Price</span>
                  <span className="result-value">${result.originalPrice.toFixed(2)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Tax Rate</span>
                  <span className="result-value">{result.taxRate}%</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Price Excl. Tax</span>
                  <span className="result-value">${result.priceExcludingTax.toFixed(2)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Price Incl. Tax</span>
                  <span className="result-value text-orange-700 font-bold">${result.priceIncludingTax.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Mode:</strong> Input price is {input.priceIncludesTax ? 'tax-inclusive (extracting tax)' : 'tax-exclusive (adding tax)'}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-300">
            <div className="text-center">
              <div className="text-5xl mb-3">🧾</div>
              <p className="text-sm">Enter values to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
