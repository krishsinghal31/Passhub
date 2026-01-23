
// src/pages/visitor/CreateEvent.jsx 
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import EventForm from '../../components/visitor/EventForm';
import SuccessModal from '../../components/common/SuccessModal';
import BackButton from '../../components/common/BackButton';
import api from '../../utils/api';

const CreateEvent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has active subscription
    if (!user.subscription || !user.subscription.isActive) {
      alert('You need an active subscription to create events. Redirecting to subscription plans...');
      navigate('/subscriptions');
      return;
    }

    // Check if subscription has expired
    const now = new Date();
    const endDate = new Date(user.subscription.endDate);
    if (now > endDate) {
      alert('Your subscription has expired. Please purchase a new subscription.');
      navigate('/subscriptions');
      return;
    }
  };

  const handleEventCreated = (event) => {
    setEventDetails(event);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <BackButton to="/dashboard" />
        <EventForm onSuccess={handleEventCreated} />
      </div>

      <SuccessModal
        isOpen={showSuccess}
        title="Event Created Successfully!"
        message={`Your event "${eventDetails?.name}" has been created. You can now manage it from your dashboard.`}
        onClose={() => setShowSuccess(false)}
        redirectPath="/dashboard"
        redirectButtonText="Go to My Events"
      />
    </div>
  );
};

export default CreateEvent;