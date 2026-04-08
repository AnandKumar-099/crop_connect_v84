import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';

const RiskAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [farmerId, setFarmerId] = useState('');
  const [riskResult, setRiskResult] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setRiskResult(null);
    setRiskMetrics(null);
    try {
      const result = await apiService.getDynamicRisk(user.id, farmerId);
      setRiskResult(result.riskProbability);
      setRiskLevel(result.riskLevel);
      setRiskMetrics(result.metrics);
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
                  <label htmlFor="farmerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Farmer ID</label>
                  <input
                    type="text"
                    id="farmerId"
                    value={farmerId}
                    onChange={(e) => setFarmerId(e.target.value)}
                    required
                    placeholder="Enter Farmer ID"
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the Farmer ID to dynamically compute contract risk based on past history.
                  </p>
                </div>
                {riskMetrics && (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                     <h4 className="font-semibold text-sm mb-2">Metrics</h4>
                     <ul className="text-xs space-y-1">
                        <li>Total Orders: {riskMetrics.totalOrders}</li>
                        <li>Past Defaults: {riskMetrics.pastDefaults}</li>
                        <li>Total Delay Days: {riskMetrics.totalDelayDays}</li>
                        <li>Reliability Score: {riskMetrics.reliability} / 5</li>
                     </ul>
                  </div>
                )}
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