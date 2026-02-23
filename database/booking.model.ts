import { Document, Model, model, models, Schema, Types } from 'mongoose';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC 5322 compliant email regex (simplified)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to validate that the referenced Event exists
 * Prevents orphaned bookings
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified('eventId')) {
    try {
      // Dynamically import Event model to avoid circular dependency
      const Event = models.Event || (await import('./event.model')).default;
      
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        return next(new Error(`Event with ID ${this.eventId} does not exist`));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('does not exist')) {
        return next(error);
      }
      return next(new Error('Error validating event reference'));
    }
  }

  next();
});

// Create index on eventId for faster query performance
BookingSchema.index({ eventId: 1 });

// Compound index for common queries (e.g., bookings per event)
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Prevent model recompilation in development (Next.js hot reload)
const Booking: Model<IBooking> = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
