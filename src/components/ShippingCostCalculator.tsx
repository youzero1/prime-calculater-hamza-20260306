'use client';

import { useState, useEffect } from 'react';
import { ShippingInput, ShippingResult } from '@/types';

interface Props {
  onSaved: () => void;
}

const ZONES = [
  { value: 1, label: 'Zone 1 — Local' },
  { value: 2, label: 'Zone 2 — Regional' },
  { value: 3, label: 'Zone 3 — National' },
  { value: 4, label: 'Zone 4 — International' },
  { value: 5, label: 'Zone 5 — Remote International' },
];

const CLASSES = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'overnight', label: 'Overnight' },
] as const;

export default function ShippingCostCalculator({ onSaved }: Props) {
  const [input, setInput] = useState<ShippingInput>({
    weight: 1,
    dimensions: { length: 20, width: 15, height: 10 },
    destinationZone: 1,
    shippingClass: 'standard',
  });
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (input.weight <= 0) { setResult(null); return; }
    const { weight, dimensions, destinationZone, shippingClass } = input;
    const volumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
    const chargeableWeight = Math.max(weight, volumetricWeight);

    const baseRates: Record<string, number> = { standard: 3.5, express: 6.5, overnight: 12 };
    const zoneMultipliers: Record<number, number> = { 1: 1, 2: 1.3, 3: 1.6, 4: 2.0, 5: 2.5 };
    const classMultipliers: Record<string, number> = { standard: 1, express: 1.5, overnight: 2.5 };
    const deliveryTimes: Record<string, Record<number, string>> = {
      standard: { 1: '3-5 days', 2: '5-7 days', 3: '7-10 days', 4: '10-14 days', 5: '14-21 days' },
      express: { 1: '1-2 days', 2: '2-3 days', 3: '3-5 days', 4: '5-7 days', 5: '7-10 days' },
      overnight: { 1: 'Next day', 2: '1-2 days', 3: '2-3 days', 4: '3-4 days', 5: '4-5 days' },
    };

    const baseRate = baseRates[shippingClass];
    const zoneMultiplier = zoneMultipliers[destinationZone] || 1;
    const classMultiplier = classMultipliers[shippingClass];
    const estimatedCost = chargeableWeight * baseRate * zoneMultiplier;
    const estimatedDelivery = deliveryTimes[shippingClass]?.[destinationZone] || 'N/A';

    setResult({
      weight,
      volumetricWeight: Math.round(volumetricWeight * 100) / 100,
      chargeableWeight: Math.round(chargeableWeight * 100) / 100,
      destinationZone,
      shippingClass,
      baseRate,
      zoneMultiplier,
      classMultiplier,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      estimatedDelivery,
    });
  }, [input]);

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shipping', input, save: true }),
      });
      if (res.ok) { setSaved(true); onSaved(); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="section-title">📦 Shipping Cost Calculator</h2>
        <p className="text-sm text-gray-400 mb-5">Estimate shipping costs by weight, size, and destination.</p>

        <div className="space-y-4">
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" min="0.01" step="0.01" className="input-field"
              value={input.weight}
              onChange={(e) => setInput((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))} />
          </div>

          <div>
            <label className="label">Dimensions (cm) — L × W × H</label>
            <div className="grid grid-cols-3 gap-2">
              {(['length', 'width', 'height'] as const).map((dim) => (
                <div key={dim}>
                  <input type="number" min="1" step="1" className="input-field"
                    placeholder={dim.charAt(0).toUpperCase()}
                    value={input.dimensions[dim]}
                    onChange={(e) => setInput((p) => ({
                      ...p,
                      dimensions: { ...p.dimensions, [dim]: parseFloat(e.target.value) || 0 },
                    }))} />
                  <p className="text-xs text-gray-400 mt-0.5 text-center">{dim}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Destination Zone</label>
            <select className="input-field" value={input.destinationZone}
              onChange={(e) => setInput((p) => ({ ...p, destinationZone: parseInt(e.target.value) }))}>
              {ZONES.map((z) => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Shipping Class</label>
            <div className="grid grid-cols-3 gap-2">
              {CLASSES.map((cls) => (
                <button key={cls.value}
                  onClick={() => setInput((p) => ({ ...p, shippingClass: cls.value }))}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    input.shippingClass === cls.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {cls.label}
                </button>
              ))}
            </div>
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
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Estimated Shipping Cost</p>
                <p className="text-4xl font-bold text-blue-700">${result.estimatedCost.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">📅 Delivery: {result.estimatedDelivery}</p>
              </div>
              <div className="space-y-2.5">
                <div className="result-row">
                  <span className="result-label">Actual Weight</span>
                  <span className="result-value">{result.weight} kg</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Volumetric Weight</span>
                  <span className="result-value">{result.volumetricWeight} kg</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Chargeable Weight</span>
                  <span className="result-value font-bold text-blue-700">{result.chargeableWeight} kg</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Base Rate</span>
                  <span className="result-value">${result.baseRate}/kg</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Zone Multiplier</span>
                  <span className="result-value">{result.zoneMultiplier}×</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Shipping Class</span>
                  <span className="result-value capitalize">{result.shippingClass}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Formula:</strong> Chargeable Weight × Base Rate × Zone Multiplier. Volumetric = L×W×H ÷ 5000.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-300">
            <div className="text-center">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-sm">Enter values to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
