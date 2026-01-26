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
<<<<<<< HEAD
            <Route
              path="/farmer/dashboard"
=======
            <Route 
              path="/farmer/dashboard" 
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboardPage />
                </ProtectedRoute>
<<<<<<< HEAD
              }
            />
            <Route
              path="/farmer/agreements"
=======
              } 
            />
            <Route 
              path="/farmer/agreements" 
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <AgreementsPage />
                </ProtectedRoute>
<<<<<<< HEAD
              }
            />

            {/* Buyer Routes */}
            <Route
              path="/buyer/dashboard"
=======
              } 
            />

            {/* Buyer Routes */}
            <Route 
              path="/buyer/dashboard" 
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboardPage />
                </ProtectedRoute>
<<<<<<< HEAD
              }
            />
            <Route
              path="/buyer/recommendations"
=======
              } 
            />
            <Route 
              path="/buyer/recommendations" 
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <RecommendationsPage />
                </ProtectedRoute>
<<<<<<< HEAD
              }
            />
            <Route
              path="/buyer/price-forecast"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'farmer']}>
                  <PriceForecastPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/risk-analysis"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'farmer']}>
                  <RiskAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/agreements"
=======
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
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <AgreementsPage />
                </ProtectedRoute>
<<<<<<< HEAD
              }
            />

=======
              } 
            />
            
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;