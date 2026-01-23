import React from 'react';
import { useLocation } from 'react-router-dom';

const PageWrapper = ({ children, className = '' }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  const wrapperClasses = isHomePage 
    ? className 
    : `pt-20 ${className}`;

  return (
    <div className={wrapperClasses}>
      {children}
    </div>
  );
};

export default PageWrapper;