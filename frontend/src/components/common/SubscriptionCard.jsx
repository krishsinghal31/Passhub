// src/components/visitor/SubscriptionCard.jsx
import React from 'react';
import { Check, Crown, Zap } from 'lucide-react';

const SubscriptionCard = ({ plan, onPurchase, loading }) => {
  const isFree = plan.price === 0;
  const isPopular = plan.name.toLowerCase().includes('monthly');

  return (
    <div className={`relative bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 ${
      isPopular ? 'border-4 border-indigo-500' : 'border border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <Crown className="w-4 h-4" />
            Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-4xl font-bold text-indigo-600">₹{plan.price}</span>
          <span className="text-gray-500">/ {plan.durationDays} days</span>
        </div>
        {plan.description && (
          <p className="text-sm text-gray-600">{plan.description}</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {plan.features && plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onPurchase(plan._id)}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
          isFree
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            {isFree ? 'Get Free Plan' : 'Purchase Plan'}
          </>
        )}
      </button>
    </div>
  );
};

export default SubscriptionCard;