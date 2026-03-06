'use client';

import { useState, useEffect } from 'react';
import { ProfitMarginInput, ProfitMarginResult } from '@/types';

interface Props {
  onSaved: () => void;
}

export default function ProfitMarginCalculator({ onSaved }: Props) {
  const [input, setInput] = useState<ProfitMarginInput>({ costPrice: 50, marginPercentage: 30 });
  const [result, setResult] = useState<ProfitMarginResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (input.costPrice > 0 && input.marginPercentage > 0 && input.marginPercentage < 100) {
      const sellingPrice = input.costPrice / (1 - input.marginPercentage / 100);
      const profitAmount = sellingPrice - input.costPrice;
      const markup = (profitAmount / input.costPrice) * 100;
      setResult({
        costPrice: input.costPrice,
        marginPercentage: input.marginPercentage,
        sellingPrice: Math.round(sellingPrice * 100) / 100,
        profitAmount: Math.round(profitAmount * 100) / 100,
        markup: Math.round(markup * 100) / 100,
      });
      setError('');
    } else if (input.marginPercentage >= 100) {
      setError('Margin must be less than 100%.');
      setResult(null);
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
        body: JSON.stringify({ type: 'margin', input, save: true }),
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
      {/* Input Panel */}
      <div className="card">
        <h2 className="section-title">📈 Profit Margin Calculator</h2>
        <p className="text-sm text-gray-400 mb-5">Calculate selling price from cost and desired margin.</p>

        <div className="space-y-4">
          <div>
            <label className="label">Cost Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              value={input.costPrice}
              onChange={(e) => setInput((prev) => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="label">Desired Margin (%)</label>
            <input
              type="number"
              min="0"
              max="99.99"
              step="0.1"
              className="input-field"
              value={input.marginPercentage}
              onChange={(e) => setInput((prev) => ({ ...prev, marginPercentage: parseFloat(e.target.value) || 0 }))}
            />
            <div className="mt-2">
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                className="w-full accent-blue-600"
                value={input.marginPercentage}
                onChange={(e) => setInput((prev) => ({ ...prev, marginPercentage: parseFloat(e.target.value) }))}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1%</span><span>45%</span><span>90%</span>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {result && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary mt-5 w-full"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save to History'}
          </button>
        )}
      </div>

      {/* Result Panel */}
      <div className="card">
        <h2 className="section-title">Results</h2>
        {result ? (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Selling Price</p>
                <p className="text-4xl font-bold text-green-700">${result.sellingPrice.toFixed(2)}</p>
              </div>
              <div className="space-y-2.5">
                <div className="result-row">
                  <span className="result-label">Cost Price</span>
                  <span className="result-value">${result.costPrice.toFixed(2)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Profit Amount</span>
                  <span className="result-value text-green-700">${result.profitAmount.toFixed(2)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Gross Margin</span>
                  <span className="result-value">{result.marginPercentage.toFixed(1)}%</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Markup</span>
                  <span className="result-value">{result.markup.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Margin = (Profit / Selling Price) × 100. Markup = (Profit / Cost Price) × 100.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-300">
            <div className="text-center">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-sm">Enter values to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
