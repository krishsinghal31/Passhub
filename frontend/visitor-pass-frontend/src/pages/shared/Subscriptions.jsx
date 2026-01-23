
// src/pages/shared/Subscriptions.jsx 
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import SubscriptionCard from '../../components/common/SubscriptionCard';
import BackButton from '../../components/common/BackButton';
import { Zap } from 'lucide-react';

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get duration from state (passed from CreateEvent)
  const eventDuration = location.state?.eventDuration;

  useEffect(() => {
    fetchPlans();
  }, [eventDuration]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      let url = '/subscriptions';
      if (eventDuration) {
        url += `?durationDays=${eventDuration}`;
      }
      
      const res = await api.get(url);
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    setPurchasingPlanId(planId);
    try {
      const res = await api.post('/host-subscription/purchase', { 
        planId,
        startDate: new Date().toISOString()
      });
      
      if (res.data.success) {
        if (res.data.subscription.paymentStatus === 'FREE') {
          // Free plan - redirect to create event
          alert('Free subscription activated!');
          navigate('/create-event');
        } else {
          // Paid plan - simulate payment confirmation for demo
          // In production, integrate with payment gateway
          const confirmPayment = window.confirm(
            `Amount to pay: ₹${res.data.amountToPay}\n\nSimulate payment success?`
          );
          
          if (confirmPayment) {
            const confirmRes = await api.post('/host-subscription/confirm-payment', {
              transactionId: `TXN${Date.now()}`
            });
            
            if (confirmRes.data.success) {
              alert('Payment successful! Subscription activated.');
              navigate('/create-event');
            }
          }
        }
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setPurchasingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <BackButton to="/create-event" />
        
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {eventDuration 
              ? `Based on your event duration (${eventDuration} days), here are the recommended plans:`
              : 'Select a plan that best fits your event hosting needs'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan._id}
                plan={plan}
                onPurchase={handlePurchase}
                loading={purchasingPlanId === plan._id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No subscription plans available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;