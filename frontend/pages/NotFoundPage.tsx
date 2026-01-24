import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="text-6xl font-bold text-green-600 dark:text-green-400">404</h1>
      <p className="text-2xl mt-4 text-gray-800 dark:text-gray-200">Page Not Found</p>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Sorry, the page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;