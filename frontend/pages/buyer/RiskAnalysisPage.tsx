import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';

const RiskAnalysisPage: React.FC = () => {
  const [quantity, setQuantity] = useState('');
  const [weatherRisk, setWeatherRisk] = useState(false);
  const [pastDelays, setPastDelays] = useState(false);
  const [riskResult, setRiskResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRiskResult(null);
    try {
      const result = await apiService.getRiskPrediction({
        quantity: parseInt(quantity),
        weatherRisk,
        pastDelays,
      });
      setRiskResult(result.riskProbability);
    } catch (error) {
      console.error("Failed to get risk prediction", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-500 dark:text-green-400';
    if (risk < 0.7) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 0.3) return 'Low Risk';
    if (risk < 0.7) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <Layout title="Contract Risk Analysis">
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Analyze Contract Risk</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Crop Quantity (kg)</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="weatherRisk" name="weatherRisk" type="checkbox" checked={weatherRisk} onChange={(e) => setWeatherRisk(e.target.checked)} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="weatherRisk" className="font-medium text-gray-700 dark:text-gray-300">High Weather Risk?</label>
                    <p className="text-gray-500 dark:text-gray-400">(e.g., predicted drought, flood)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="pastDelays" name="pastDelays" type="checkbox" checked={pastDelays} onChange={(e) => setPastDelays(e.target.checked)} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="pastDelays" className="font-medium text-gray-700 dark:text-gray-300">History of Past Delays?</label>
                    <p className="text-gray-500 dark:text-gray-400">(with this farmer or region)</p>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 transition-colors">
                  {loading ? 'Analyzing...' : 'Analyze Risk'}
                </button>
              </form>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8">
              <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400">Risk Probability</h4>
              {loading && <p className="mt-4">Calculating...</p>}
              {riskResult !== null && (
                <div className="text-center mt-4">
                  <p className={`text-6xl font-bold ${getRiskColor(riskResult)}`}>
                    {(riskResult * 100).toFixed(1)}%
                  </p>
                  <p className={`text-xl font-semibold mt-2 ${getRiskColor(riskResult)}`}>
                    {getRiskLabel(riskResult)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default RiskAnalysisPage;