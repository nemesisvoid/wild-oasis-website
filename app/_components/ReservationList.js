'use client';
import { deleteReservation } from '../_lib/actions';
import ReservationCard from './ReservationCard';

import { useOptimistic } from 'react';

function ReservationList({ bookings }) {
  const [optimisticBookings, optimisticDelete] = useOptimistic(bookings, (curBooking, bookingId) => {
    return curBooking.filter(booking => booking.id !== bookingId);
  });

  async function handleDelete(bookingId) {
    optimisticDelete(bookingId);
    await deleteReservation(bookingId);
  }

  return (
    <ul className='space-y-6'>
      {optimisticBookings.map(booking => (
        <ReservationCard
          onDelete={handleDelete}
          booking={booking}
          key={booking.id}
        />
      ))}
    </ul>
  );
}

export default ReservationList;
