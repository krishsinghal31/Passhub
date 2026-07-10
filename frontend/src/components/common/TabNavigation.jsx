// src/components/common/TabNavigation.jsx
import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-2 mb-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon && <tab.icon className="w-5 h-5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-600' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;