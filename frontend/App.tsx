import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage';
import BuyerDashboardPage from './pages/buyer/BuyerDashboardPage';
import RecommendationsPage from './pages/buyer/RecommendationsPage';
import PriceForecastPage from './pages/buyer/PriceForecastPage';
import RiskAnalysisPage from './pages/buyer/RiskAnalysisPage';
import AgreementsPage from './pages/shared/AgreementsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Farmer Routes */}
            <Route 
              path="/farmer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/farmer/agreements" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <AgreementsPage />
                </ProtectedRoute>
              } 
            />

            {/* Buyer Routes */}
            <Route 
              path="/buyer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer/recommendations" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <RecommendationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer/price-forecast" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <PriceForecastPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer/risk-analysis" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <RiskAnalysisPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer/agreements" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <AgreementsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;