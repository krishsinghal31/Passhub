// src/utils/helpers.js
export const formatDate = (date) => new Date(date).toLocaleDateString();
export const calculateRefund = (amount, percent) => Math.floor(amount * percent / 100);
export const isEventActive = (event) => {
  const now = new Date();
  return now >= new Date(event.eventDates.start) && now <= new Date(event.eventDates.end);
};