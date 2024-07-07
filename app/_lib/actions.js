'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import { getBookings, updateGuest } from './data-service';
import { supabase } from './supabase';
import { redirect } from 'next/navigation';

export async function updateProfile(formData) {
  const session = await auth();
  if (!session) throw new Error('user needs to be logged in');
  const nationalID = formData.get('nationalID');

  const [nationality, countryFlag] = formData.get('nationality').split('%');

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) throw new Error('enter a valid national ID');

  const updateData = { nationalID, nationality, countryFlag };

  const { data, error } = await supabase.from('guests').update(updateData).eq('id', session.user.guestId);

  if (error) throw new Error('user could not be updated');

  revalidatePath('/account/profile');
}

export async function signInAction() {
  await signIn('google', { redirectTo: '/account' });
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error('user needs to be logged in');

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get('numGuests')),
    observations: formData.get('observations').slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: 'unconfirmed',
  };

  const { error } = await supabase.from('bookings').insert([newBooking]);

  if (error) throw new Error(error.message);

  console.log('form data....', formData, newBooking);
  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect('/cabins/thankyou');
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error('user needs to be logged in');

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map(booking => booking.id);

  if (!guestBookingIds.includes(bookingId)) throw new Error('you are not authorized to delete this booking');
  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

  if (error) throw new Error('error deleting reservation');

  revalidatePath('/account/reservations');
}

export async function updateReservation(formData) {
  const session = await auth();
  if (!session) throw new Error('user needs to be logged in');
  const numGuests = formData.get('numGuests');
  const observations = formData.get('observations');
  const bookingId = Number(formData.get('bookingId'));
  const updateBooking = { numGuests, observations };

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map(booking => booking.id);

  if (!guestBookingsIds.includes(bookingId)) throw new Error('you are not authorized to update this reservation');

  const { data, error } = await supabase.from('bookings').update(updateBooking).eq('id', bookingId);

  if (error) throw new Error('error updating reservation');

  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath('/account/reservations');
  redirect('/account/reservations');
}
