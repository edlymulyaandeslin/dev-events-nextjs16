'use server';

import Booking from '@/database/booking.model';
import connectDB from '../mongodb';

interface CreateBookingParams {
  eventId: string;
  email: string;
}

export const createBooking = async ({
  eventId,
  email,
}: CreateBookingParams) => {
  try {
    await connectDB();

    await Booking.create({ eventId, email });

    return { success: true };
  } catch (error) {
    console.error('create booking failed', error);
    return { success: false };
  }
};
