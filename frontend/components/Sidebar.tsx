import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DocumentTextIcon, HomeIcon, LightBulbIcon, PresentationChartLineIcon, ShieldCheckIcon, UserGroupIcon } from './icons';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const farmerLinks = [
    { path: '/farmer/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/farmer/agreements', label: 'Agreements', icon: <DocumentTextIcon /> },
<<<<<<< HEAD
    { path: '/buyer/price-forecast', label: 'Price Forecast', icon: <PresentationChartLineIcon /> },
=======
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
  ];

  const buyerLinks = [
    { path: '/buyer/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/buyer/recommendations', label: 'Recommendations', icon: <UserGroupIcon /> },
    { path: '/buyer/price-forecast', label: 'Price Forecast', icon: <PresentationChartLineIcon /> },
    { path: '/buyer/risk-analysis', label: 'Risk Analysis', icon: <ShieldCheckIcon /> },
    { path: '/buyer/agreements', label: 'Agreements', icon: <DocumentTextIcon /> },
  ];

  const links = user?.role === 'farmer' ? farmerLinks : buyerLinks;

  const linkClasses = (path: string) =>
<<<<<<< HEAD
    `flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-800 dark:hover:text-green-300 rounded-lg transition-all duration-200 group ${location.pathname === path ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 font-semibold' : ''
=======
    `flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-800 dark:hover:text-green-300 rounded-lg transition-all duration-200 group ${
      location.pathname === path ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 font-semibold' : ''
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
    }`;

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center space-x-3 px-4 h-16">
        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
<<<<<<< HEAD
          <LightBulbIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
=======
            <LightBulbIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
        </div>
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">CropConnect</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink to={link.path} className={linkClasses(link.path)}>
                <span className="w-6 h-6 mr-3 transition-transform duration-200 group-hover:scale-110">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;