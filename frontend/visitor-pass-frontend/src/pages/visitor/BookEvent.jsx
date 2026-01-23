// src/pages/visitor/BookEvent.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import BookingForm from '../../components/visitor/BookingForm';

const BookEvent = () => {
  const { placeId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Book Event</h1>
      <BookingForm placeId={placeId} />
    </div>
  );
};

export default BookEvent;