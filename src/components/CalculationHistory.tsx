'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalculationRecord } from '@/types';

interface Props {
  refresh: number;
}

const TYPE_LABELS: Record<string, string> = {
  margin: '📈 Profit Margin',
  tax: '🧾 Tax',
  discount: '🏷️ Discount',
  shipping: '📦 Shipping',
};

const TYPE_BADGE: Record<string, string> = {
  margin: 'badge badge-margin',
  tax: 'badge badge-tax',
  discount: 'badge badge-discount',
  shipping: 'badge badge-shipping',
};

function formatSummary(type: string, result: string): string {
  try {
    const r = JSON.parse(result);
    switch (type) {
      case 'margin': return `Sell: $${r.sellingPrice?.toFixed(2)} | Profit: $${r.profitAmount?.toFixed(2)} | Markup: ${r.markup?.toFixed(1)}%`;
      case 'tax': return `Tax: $${r.taxAmount?.toFixed(2)} | Incl: $${r.priceIncludingTax?.toFixed(2)} | Excl: $${r.priceExcludingTax?.toFixed(2)}`;
      case 'discount': return `Final: $${r.finalPrice?.toFixed(2)} | Saved: $${r.savings?.toFixed(2)} | Total: $${r.totalPrice?.toFixed(2)}`;
      case 'shipping': return `Cost: $${r.estimatedCost?.toFixed(2)} | Delivery: ${r.estimatedDelivery} | Weight: ${r.chargeableWeight}kg`;
      default: return result;
    }
  } catch { return result; }
}

export default function CalculationHistory({ refresh }: Props) {
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.records) setRecords(data.records);
      else setError('Failed to load history.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory, refresh]);

  const deleteRecord = async (id: number) => {
    await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = async () => {
    if (!confirm('Delete all calculation history? This cannot be undone.')) return;
    setClearing(true);
    await fetch('/api/history', { method: 'DELETE' });
    setRecords([]);
    setClearing(false);
  };

  const filtered = filter === 'all' ? records : records.filter((r) => r.type === filter);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title mb-1">🕓 Calculation History</h2>
          <p className="text-sm text-gray-400">{records.length} saved calculation{records.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button onClick={clearAll} disabled={clearing} className="btn-danger">
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
          <button onClick={fetchHistory} className="btn-secondary text-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {['all', 'margin', 'tax', 'discount', 'shipping'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {f === 'all' ? 'All Types' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading history...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex items-center justify-center py-16 text-gray-300">
          <div className="text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm">No calculations saved yet.</p>
            <p className="text-xs mt-1">Use any calculator and click "Save to History"</p>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((record) => (
            <div key={record.id}
              className="border border-gray-100 rounded-xl overflow-hidden hover:border-blue-100 transition-colors">
              <div className="flex items-center justify-between p-4 bg-white cursor-pointer"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={TYPE_BADGE[record.type] || 'badge bg-gray-100 text-gray-700'}>
                    {record.type}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {formatSummary(record.type, record.result)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(record.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                    title="Delete"
                  >
                    🗑️
                  </button>
                  <span className="text-gray-400 text-xs">{expandedId === record.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === record.id && (
                <div className="border-t border-gray-50 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Input</p>
                      <pre className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-3 overflow-auto">
                        {JSON.stringify(JSON.parse(record.input), null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Result</p>
                      <pre className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-3 overflow-auto">
                        {JSON.stringify(JSON.parse(record.result), null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
