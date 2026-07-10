// src/components/common/ThemeToggle.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';  // Install @heroicons/react if needed

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-6 w-6 text-yellow-500" />  // Sun for switching to light
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-600" />  // Moon for switching to dark
      )}
    </button>
  );
};

export default ThemeToggle;