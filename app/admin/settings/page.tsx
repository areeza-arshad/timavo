'use client';
import { useState, useEffect } from 'react';
import { Percent, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function CommissionSettings() {
  const [rate, setRate] = useState(9);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRate();
  }, []);

  const fetchRate = async () => {
    const res = await fetch('/api/admin/commission');
    const data = await res.json();
    setRate(data.rate);
  };

  const updateRate = async () => {
    setLoading(true);
    setMessage(null);
    
    const res = await fetch('/api/admin/commission', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate })
    });
    
    if (res.ok) {
      setMessage({ type: 'success', text: 'Commission rate updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Failed to update commission rate' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sand/40 py-6 px-4 sm:py-8 sm:px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark text-center">Commission Settings</h1>
          <p className="text-charcoal/70 text-sm sm:text-base text-center mt-1">Manage affiliate commission rates</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 px-6 py-8 text-center border-b border-gray-100">
            <p className="text-sm text-charcoal/60 uppercase tracking-wide mb-2">Current Commission Rate</p>
            <div className="flex items-center justify-center gap-2">
              <Percent className="h-8 w-8 text-gold" />
              <span className="text-5xl sm:text-6xl font-bold text-gold">{rate}</span>
              <span className="text-2xl sm:text-3xl text-charcoal/60">%</span>
            </div>
            <p className="text-xs text-charcoal/50 mt-3">Applies to all new affiliate orders</p>
          </div>

          <div className="p-6 space-y-6">
            {message && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm flex-1">{message.text}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                New Commission Rate (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/40" />
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                  step="0.5"
                  min="0"
                  max="100"
                  placeholder="Enter commission rate"
                />
              </div>
              <p className="text-xs text-charcoal/50 mt-2">
                Enter a value between 0% and 100%
              </p>
            </div>

            <button
              onClick={updateRate}
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <div className="bg-sand/20 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-charcoal">Important Note</p>
                  <p className="text-xs text-charcoal/60">
                    Rate changes apply to future orders only. Existing commissions will retain their original rate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}