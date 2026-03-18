import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoutIcon, UserCircleIcon } from './icons';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-green-500 dark:ring-green-400" />
              ) : (
                  <img src="/default-user.png" alt="Default User" className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-300 dark:ring-gray-600" />
              )}
              <span className="hidden md:inline text-gray-700 dark:text-gray-300 font-medium">{user?.name}</span>
            </button>
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-xl z-10 origin-top-right ring-1 ring-black ring-opacity-5"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <div className="py-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                  >
                    <LogoutIcon className="w-5 h-5 mr-2" />
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;