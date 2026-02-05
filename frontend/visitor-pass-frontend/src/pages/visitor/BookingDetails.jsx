// src/pages/visitor/BookingDetails.jsx 

// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   Calendar, 
//   MapPin, 
//   Users, 
//   CreditCard, 
//   Download, 
//   Ticket, 
//   AlertCircle, 
//   CheckCircle2, 
//   Clock, 
//   XCircle 
// } from 'lucide-react';
// import api from '../../utils/api';
// import BackButton from '../../components/common/BackButton';
// import PageWrapper from '../../components/common/PageWrapper';

// const BookingDetails = () => {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedPasses, setSelectedPasses] = useState([]);
//   const [actionLoading, setActionLoading] = useState(false);

//   const fetchBookingDetails = useCallback(async () => {
//     try {
//       const res = await api.get(`/passes/booking/${bookingId}`);
//       if (res.data.success) {
//         setBooking(res.data.booking);
//       }
//     } catch (error) {
//       console.error('Error fetching booking details:', error);
//       alert('Failed to load booking details');
//       navigate('/dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, [bookingId, navigate]);

//   useEffect(() => {
//     fetchBookingDetails();
//   }, [fetchBookingDetails]);

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     return new Date(dateStr).toLocaleDateString('en-US', { 
//       weekday: 'long',
//       month: 'long', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   const handleCancelSelected = async () => {
//     if (selectedPasses.length === 0) return;
//     if (!window.confirm(`Are you sure you want to cancel ${selectedPasses.length} pass(es)?`)) return;

//     setActionLoading(true);
//     try {
//       const res = await api.patch('/passes/cancel-bulk', { 
//         passIds: selectedPasses,
//         reason: "Cancelled by user from booking details" 
//       });
//       if (res.data.success) {
//         alert(`${selectedPasses.length} passes cancelled successfully`);
//         fetchBookingDetails();
//         setSelectedPasses([]);
//       }
//     } catch (error) {
//       alert('Error: ' + (error.response?.data?.message || error.message));
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const togglePassSelection = (passId) => {
//     setSelectedPasses(prev =>
//       prev.includes(passId) ? prev.filter(id => id !== passId) : [...prev, passId]
//     );
//   };

//   const getStatusBadge = (status, visitDate) => {
//     const isPast = new Date(visitDate) < new Date().setHours(0,0,0,0);
    
//     if (status === 'CANCELLED') return { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={14}/> };
//     if (isPast && status === 'APPROVED') return { label: 'Expired', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Clock size={14}/> };
//     if (status === 'APPROVED') return { label: 'Valid', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 size={14}/> };
//     return { label: status, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <AlertCircle size={14}/> };
//   };

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-500 font-medium">Fetching Tickets...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!booking) return null;

//   return (
//     <PageWrapper className="min-h-screen bg-slate-50 py-10 px-6">
//       <div className="max-w-4xl mx-auto">
//         <BackButton to="/dashboard" />
        
//         <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
//           {/* Top Banner */}
//           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 text-white">
//             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
//               <div>
//                 <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2">Booking Confirmation</p>
//                 <h1 className="text-4xl font-black mb-4">{booking.place?.name}</h1>
//                 <div className="flex flex-wrap gap-4 text-sm font-medium">
//                   <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-lg"><MapPin size={16}/> {booking.place?.location}</div>
//                   <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-lg"><Calendar size={16}/> {formatDate(booking.visitDate)}</div>
//                 </div>
//               </div>
//               <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-center min-w-[160px]">
//                 <p className="text-[10px] uppercase tracking-tighter opacity-70 mb-1">Status</p>
//                 <p className="text-2xl font-black tracking-tight">{booking.status}</p>
//                 <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
//                   <div className="h-full bg-white w-full"></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="p-8 md:p-12">
//             {/* Financial Summary */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
//               <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
//                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Users size={24}/></div>
//                 <div>
//                   <p className="text-xs text-gray-500 font-bold uppercase">Guest Count</p>
//                   <p className="text-xl font-bold">{booking.guestCount} Visitors</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
//                 <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><CreditCard size={24}/></div>
//                 <div>
//                   <p className="text-xs text-gray-500 font-bold uppercase">Payment</p>
//                   <p className="text-xl font-bold">
//                     ₹{booking.totalAmount} 
//                     {booking.totalAmount === 0 && <span className="ml-2 text-sm text-green-600">(Complimentary)</span>}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Pass Section */}
//             <div className="flex justify-between items-end mb-8">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800">Your Digital Passes</h2>
//                 <p className="text-gray-500 text-sm">Select passes to download or cancel</p>
//               </div>
//               {selectedPasses.length > 0 && (
//                 <button
//                   onClick={handleCancelSelected}
//                   disabled={actionLoading}
//                   className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all flex items-center gap-2"
//                 >
//                   {actionLoading ? 'Processing...' : `Cancel Selected (${selectedPasses.length})`}
//                 </button>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {booking.passes?.map((pass, i) => {
//                 const badge = getStatusBadge(pass.status, booking.visitDate);
//                 const isCancellable = pass.status !== 'CANCELLED' && (new Date(booking.visitDate) >= new Date().setHours(0,0,0,0));

//                 return (
//                   <div key={i} className="relative group">
//                     <div className={`absolute -inset-0.5 bg-gradient-to-r ${pass.status === 'CANCELLED' ? 'from-slate-200 to-slate-300' : 'from-indigo-500 to-purple-600'} rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
//                     <div className="relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col h-full shadow-sm">
                      
//                       {/* Ticket Header */}
//                       <div className="p-6 flex justify-between items-start bg-slate-50/50">
//                         <div className="flex items-center gap-3">
//                           {isCancellable && (
//                             <input
//                               type="checkbox"
//                               checked={selectedPasses.includes(pass._id)}
//                               onChange={() => togglePassSelection(pass._id)}
//                               className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                             />
//                           )}
//                           <div>
//                             <h3 className="font-bold text-gray-800 text-lg">{pass.guest?.name}</h3>
//                             <p className="text-xs text-gray-500 font-medium">{pass.guest?.email || 'Individual Guest'}</p>
//                           </div>
//                         </div>
//                         <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.color}`}>
//                           {badge.icon} {badge.label}
//                         </span>
//                       </div>

//                       {/* QR Body */}
//                       <div className="flex-1 p-8 flex flex-col items-center justify-center border-y-2 border-dashed border-slate-100 relative">
//                         {/* Fake Ticket Notches */}
//                         <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full"></div>
//                         <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 border border-slate-100 rounded-full"></div>

//                         {pass.qrImage && pass.status !== 'CANCELLED' ? (
//                           <div className="text-center">
//                             <div className="p-4 bg-white rounded-3xl shadow-inner mb-4 border border-slate-50">
//                               <img src={pass.qrImage} alt="Pass QR" className="w-40 h-40 object-contain mx-auto" />
//                             </div>
//                             <p className="text-[10px] font-mono text-gray-400 bg-slate-50 px-3 py-1 rounded-full inline-block uppercase tracking-tighter">
//                               Slot: #{pass.slotNumber || 'Auto'} • ID: {pass._id.slice(-8)}
//                             </p>
//                           </div>
//                         ) : (
//                           <div className="text-center py-10">
//                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
//                               <Ticket size={40} />
//                             </div>
//                             <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
//                               {pass.status === 'CANCELLED' ? 'Pass Void' : 'QR Pending'}
//                             </p>
//                           </div>
//                         )}
//                       </div>

//                       {/* Ticket Footer */}
//                       <div className="p-4 bg-slate-50/30 flex justify-center">
//                         {pass.qrImage && pass.status === 'APPROVED' && (
//                           <button className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition-colors">
//                             <Download size={14} /> Download PDF Ticket
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </PageWrapper>
//   );
// };

// export default BookingDetails;

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  Ticket, 
  Download, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import api from '../../utils/api';
import BackButton from '../../components/common/BackButton';
import PageWrapper from '../../components/common/PageWrapper';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await api.get(`/passes/booking/${bookingId}`);
      if (res.data.success && res.data.booking) {
        setBooking(res.data.booking);
      } else {
        throw new Error("No booking data found");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load booking details");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!booking) return null;

  const visitDate = new Date(booking.visitDate);
  const isPast = visitDate < new Date().setHours(0,0,0,0);
  const status = isPast && booking.status === 'CONFIRMED' ? 'EXPIRED' : booking.status;

  return (
    <PageWrapper className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/dashboard" />
          <div className="flex items-center gap-2 text-slate-400 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <Info size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">ID: {booking._id.slice(-12)}</span>
          </div>
        </div>

        {/* MAIN TICKET CONTAINER */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100">
          
          {/* HEADER SECTION */}
          <div className="relative bg-indigo-600 p-8 md:p-12 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md 
                    ${status === 'CONFIRMED' ? 'bg-green-500/20 border-green-400 text-green-200' : 
                      status === 'CANCELLED' ? 'bg-red-500/20 border-red-400 text-red-200' : 
                      'bg-white/20 border-white/40 text-white'}`}>
                    ● {status}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                  {booking.place?.name}
                </h1>
                <div className="flex flex-wrap gap-6 text-indigo-100">
                  <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-wider">
                    <MapPin size={18} className="text-indigo-300" /> {booking.place?.location}
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-wider">
                    <Calendar size={18} className="text-indigo-300" /> {visitDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <Ticket size={120} className="text-white/10 -rotate-12" />
              </div>
            </div>
          </div>

          {/* PERFORATION DIVIDER */}
          <div className="relative h-2 bg-white flex items-center justify-between px-4">
            <div className="absolute left-0 -ml-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 shadow-inner"></div>
            <div className="w-full border-t-2 border-dashed border-slate-200 mx-4"></div>
            <div className="absolute right-0 -mr-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100 shadow-inner"></div>
          </div>

          <div className="p-8 md:p-12 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* LEFT: BOOKING INFO */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Payment Summary</h3>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Guest Count</span>
                      <span className="font-black text-slate-800">{booking.guestCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Total Paid</span>
                      <span className="text-2xl font-black text-indigo-600">₹{booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4">
                  <ShieldCheck className="text-indigo-600 shrink-0" size={24} />
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                    This booking is secured by PassHub. Show the QR codes on the right to the security personnel at the entry gate.
                  </p>
                </div>
              </div>

              {/* RIGHT: PASS CARDS */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Entry Passes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {booking.passes?.map((pass, i) => (
                    <div key={i} className={`group relative bg-white border-2 rounded-[2.5rem] p-6 transition-all 
                      ${pass.status === 'CANCELLED' ? 'opacity-60 border-slate-100 bg-slate-50' : 'border-slate-100 hover:border-indigo-500 hover:shadow-xl'}`}>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mb-1">Pass #{i+1}</p>
                          <h4 className="font-black text-slate-800 text-lg">{pass.guest?.name}</h4>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase
                            ${pass.checkInTime ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                            {pass.checkInTime ? '✓ Checked In' : '• Ready'}
                          </span>
                        </div>
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm rotate-3">
                          {pass.slotNumber || i+1}
                        </div>
                      </div>

                      <div className="relative aspect-square bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border-2 border-slate-100 shadow-inner group-hover:bg-white transition-colors overflow-hidden">
                        {pass.qrImage && pass.status !== 'CANCELLED' ? (
                          <>
                            <img src={pass.qrImage} alt="QR" className="w-40 h-40 object-contain relative z-10" />
                            <div className="mt-4 flex items-center gap-2 text-slate-400">
                                <Download size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Download Pass</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <XCircle size={48} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase">Invalid</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default BookingDetails;