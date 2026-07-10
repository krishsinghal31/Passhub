// src/components/common/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4 group"
    >
      <ChevronLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;