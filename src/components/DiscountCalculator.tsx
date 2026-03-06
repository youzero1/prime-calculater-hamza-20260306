'use client';

import { useState, useEffect } from 'react';
import { DiscountInput, DiscountResult, DiscountTier } from '@/types';

interface Props {
  onSaved: () => void;
}

export default function DiscountCalculator({ onSaved }: Props) {
  const [input, setInput] = useState<DiscountInput>({
    originalPrice: 100,
    discountType: 'percentage',
    discountValue: 20,
    quantity: 1,
    bulkTiers: [],
  });
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [newTier, setNewTier] = useState<DiscountTier>({ minQuantity: 10, discountPercentage: 15 });

  useEffect(() => {
    if (input.originalPrice <= 0) { setResult(null); return; }
    let discountAmount = 0;
    let appliedTier: DiscountTier | undefined;

    if (input.bulkTiers && input.bulkTiers.length > 0) {
      const sorted = [...input.bulkTiers].sort((a, b) => b.minQuantity - a.minQuantity);
      appliedTier = sorted.find((t) => input.quantity >= t.minQuantity);
    }

    const effValue = appliedTier ? appliedTier.discountPercentage : input.discountValue;
    const effType = appliedTier ? 'percentage' : input.discountType;

    if (effType === 'percentage') {
      discountAmount = (input.originalPrice * effValue) / 100;
    } else {
      discountAmount = Math.min(effValue, input.originalPrice);
    }

    const finalPrice = Math.max(0, input.originalPrice - discountAmount);
    const totalPrice = finalPrice * input.quantity;
    const savings = discountAmount * input.quantity;

    setResult({
      originalPrice: input.originalPrice,
      discountType: effType,
      discountValue: effValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      appliedTier,
    });
  }, [input]);

  const addTier = () => {
    if (newTier.minQuantity > 0 && newTier.discountPercentage > 0 && newTier.discountPercentage <= 100) {
      setInput((prev) => ({ ...prev, bulkTiers: [...(prev.bulkTiers || []), newTier] }));
      setNewTier({ minQuantity: newTier.minQuantity + 10, discountPercentage: newTier.discountPercentage + 5 });
    }
  };

  const removeTier = (index: number) => {
    setInput((prev) => ({ ...prev, bulkTiers: prev.bulkTiers?.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'discount', input, save: true }),
      });
      if (res.ok) { setSaved(true); onSaved(); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="section-title">🏷️ Discount Calculator</h2>
        <p className="text-sm text-gray-400 mb-5">Calculate final prices after applying discounts.</p>

        <div className="space-y-4">
          <div>
            <label className="label">Original Price ($)</label>
            <input type="number" min="0" step="0.01" className="input-field"
              value={input.originalPrice}
              onChange={(e) => setInput((p) => ({ ...p, originalPrice: parseFloat(e.target.value) || 0 }))} />
          </div>

          <div>
            <label className="label">Discount Type</label>
            <div className="flex gap-2">
              {(['percentage', 'fixed'] as const).map((t) => (
                <button key={t} onClick={() => setInput((p) => ({ ...p, discountType: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    input.discountType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {t === 'percentage' ? '% Percentage' : '$ Fixed Amount'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              {input.discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount ($)'}
            </label>
            <input type="number" min="0" step="0.01" className="input-field"
              value={input.discountValue}
              onChange={(e) => setInput((p) => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} />
          </div>

          <div>
            <label className="label">Quantity</label>
            <input type="number" min="1" step="1" className="input-field"
              value={input.quantity}
              onChange={(e) => setInput((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} />
          </div>

          {/* Bulk Tiers */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Bulk Discount Tiers</span>
              <button onClick={() => setShowBulk(!showBulk)}
                className="text-xs text-blue-600 hover:underline">
                {showBulk ? 'Hide' : 'Configure'}
              </button>
            </div>

            {input.bulkTiers && input.bulkTiers.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {input.bulkTiers.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-600">
                      {tier.minQuantity}+ units → {tier.discountPercentage}% off
                    </span>
                    <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}

            {showBulk && (
              <div className="flex gap-2">
                <input type="number" placeholder="Min qty" className="input-field text-xs"
                  value={newTier.minQuantity}
                  onChange={(e) => setNewTier((p) => ({ ...p, minQuantity: parseInt(e.target.value) || 0 }))} />
                <input type="number" placeholder="Disc %" className="input-field text-xs"
                  value={newTier.discountPercentage}
                  onChange={(e) => setNewTier((p) => ({ ...p, discountPercentage: parseFloat(e.target.value) || 0 }))} />
                <button onClick={addTier} className="btn-primary text-xs px-3 py-2 whitespace-nowrap">Add</button>
              </div>
            )}
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
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Final Price per Unit</p>
                <p className="text-4xl font-bold text-purple-700">${result.finalPrice.toFixed(2)}</p>
                {result.appliedTier && (
                  <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Bulk tier applied ({result.appliedTier.minQuantity}+ units)
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                <div className="result-row">
                  <span className="result-label">Original Price</span>
                  <span className="result-value">${result.originalPrice.toFixed(2)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Discount</span>
                  <span className="result-value text-purple-700">
                    -{result.discountType === 'percentage' ? `${result.discountValue}%` : `$${result.discountValue}`}
                    {' '}(${result.discountAmount.toFixed(2)})
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Quantity</span>
                  <span className="result-value">{input.quantity} units</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Total Price</span>
                  <span className="result-value font-bold text-purple-700">${result.totalPrice.toFixed(2)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Total Savings</span>
                  <span className="result-value text-green-600">-${result.savings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-300">
            <div className="text-center">
              <div className="text-5xl mb-3">🏷️</div>
              <p className="text-sm">Enter values to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
