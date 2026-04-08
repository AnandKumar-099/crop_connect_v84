import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { PriceDataPoint } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const PriceForecastPage: React.FC = () => {
  const [crop, setCrop] = useState('Wheat');
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [forecast, setForecast] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const availableCrops = ['Wheat', 'Rice', 'Corn', 'Soybean'];

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const data = await apiService.getPriceForecast(crop);
        setPriceData(data.history);
        setForecast(data.forecast);
      } catch (error) {
        console.error("Failed to fetch price forecast", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [crop]);

  const chartData = forecast ? [...priceData, { date: 'Forecast', price: forecast }] : priceData;
  const tickColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';

  return (
    <Layout title="Crop Price Forecast">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card title="Select Crop">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Card>
          <Card title="Forecast" className="mt-8 text-center">
            {loading ? (
              <p>Loading forecast...</p>
            ) : forecast !== null ? (
              <>
                <p className="text-gray-600 dark:text-gray-400">Expected price for {crop} tomorrow:</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">₹{forecast.toFixed(2)}</p>
                <p className="text-gray-600 dark:text-gray-400">per kg</p>
              </>
            ) : (
              <p>Could not retrieve forecast.</p>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title={`Price Trend for ${crop}`}>
            {loading ? (
              <div className="h-80 flex items-center justify-center">Loading chart...</div>
            ) : (
              <div style={{ width: '100%', minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}/>
                    <XAxis dataKey="date" tick={{ fill: tickColor }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: tickColor }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
                            borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0'
                        }}
                    />
                    <Legend wrapperStyle={{ color: tickColor }}/>
                    <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} name="Historical Price" />
                    {forecast && (
                       <Line type="monotone" dataKey="price" stroke="#82ca9d" strokeDasharray="5 5" name="Forecasted Price" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PriceForecastPage;