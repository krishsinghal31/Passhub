// import React, { useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../context/AuthContext';
// import EventForm from '../../components/visitor/EventForm';
// import SuccessModal from '../../components/common/SuccessModal';
// import BackButton from '../../components/common/BackButton';
// import PageWrapper from '../../components/common/PageWrapper';

// const CreateEvent = () => {
//     const { user } = useContext(AuthContext);
//     const navigate = useNavigate();
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [eventDetails, setEventDetails] = useState(null);

//     useEffect(() => {
//         if (!user) {
//             navigate('/login');
//             return;
//         }
//         // ✅ Removed the auto-redirect from here so they can fill the form
//     }, [user, navigate]);

//     const handleEventSubmission = (formData) => {
//         // ✅ Check Subscription Law upon submission
//         if (!user?.subscription?.isActive) {
//             // Redirect to subscriptions and pass the event dates
//             // This allows the subscription page to suggest the best plan
//             navigate('/subscriptions', { 
//                 state: { 
//                     eventDates: {
//                         start: formData.eventDates?.start,
//                         end: formData.eventDates?.end
//                     },
//                     pendingEvent: formData // Optional: save their work
//                 } 
//             });
//             return false; // Stop the EventForm from proceeding with API call
//         }
//         return true; // Allow EventForm to proceed
//     };

//     const handleEventCreated = (event) => {
//         setEventDetails(event);
//         setShowSuccess(true);
//     };

//     const handleCloseModal = () => {
//         setShowSuccess(false);
//         navigate('/dashboard'); 
//     };

//     return (
//         <PageWrapper className="min-h-screen bg-slate-50 py-10 px-6">
//             <div className="max-w-4xl mx-auto">
//                 <div className="mb-8 flex items-center justify-between">
//                     <BackButton to="/dashboard" />
//                     <div className="text-right">
//                         <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Event</h1>
//                         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Host a new experience</p>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
//                     {/* Pass the check function to the form */}
//                     <EventForm 
//                         onSuccess={handleEventCreated} 
//                         onBeforeSubmit={handleEventSubmission}
//                     />
//                 </div>
//             </div>

//             {/* Confirmation Modal */}
//             {showSuccess && (
//                 <SuccessModal
//                     isOpen={showSuccess}
//                     title="Event is Live! 🚀"
//                     message={`"${eventDetails?.name}" has been created successfully. Your dashboard is now updated with hosting controls.`}
//                     onClose={handleCloseModal}
//                     confirmText="Go to Dashboard"
//                 />
//             )}
//         </PageWrapper>
//     );
// };

// export default CreateEvent;


import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import EventForm from '../../components/visitor/EventForm';
import SuccessModal from '../../components/common/SuccessModal';
import BackButton from '../../components/common/BackButton';
import PageWrapper from '../../components/common/PageWrapper';
import { Sparkles } from 'lucide-react';

const CreateEvent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); }
  }, [user, navigate]);

  const handleEventSubmission = (formData) => {
    if (!user?.subscription?.isActive) {
      navigate('/subscriptions', { 
        state: { 
          eventDates: { start: formData.eventDates?.start, end: formData.eventDates?.end },
          pendingEvent: formData 
        } 
      });
      return false;
    }
    return true; 
  };

  const handleEventCreated = (event) => {
    setEventDetails(event);
    setShowSuccess(true);
  };

  return (
    <PageWrapper className="min-h-screen bg-[#0f172a] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <BackButton to="/dashboard" className="text-slate-400 hover:text-white" />
          <div className="text-right">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-end gap-3">
              Create Event <Sparkles className="text-cyan-400" size={24}/>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Launch a new experience</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden p-1">
           <div className="bg-[#0f172a] rounded-[2.3rem] p-8 border border-slate-800/50">
            <EventForm 
              onSuccess={handleEventCreated} 
              onBeforeSubmit={handleEventSubmission}
            />
           </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          isOpen={showSuccess}
          title="Event is Live! 🚀"
          message={`"${eventDetails?.name}" has been created. Control it from your dashboard.`}
          onClose={() => { setShowSuccess(false); navigate('/dashboard'); }}
          confirmText="Go to Dashboard"
        />
      )}
    </PageWrapper>
  );
};

export default CreateEvent;