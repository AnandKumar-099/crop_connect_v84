import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;