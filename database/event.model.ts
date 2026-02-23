import { Document, Model, model, models, Schema } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

/**
 * Pre-save hook to auto-generate slug and normalize date/time
 * Only regenerates slug if title is modified
 */
EventSchema.pre('save', function (next) {
  // Generate slug only if title is new or modified
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO 8601 format (YYYY-MM-DD)
  if (this.isModified('date')) {
    try {
      const parsedDate = new Date(this.date);
      if (isNaN(parsedDate.getTime())) {
        return next(
          new Error('Invalid date format. Please provide a valid date.'),
        );
      }
      // Store in ISO format (YYYY-MM-DD)
      this.date = parsedDate.toISOString().split('T')[0];
    } catch (error) {
      return next(new Error('Error parsing date'));
    }
  }

  // Normalize time to 24-hour format (HH:MM)
  if (this.isModified('time')) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.time)) {
      // Try to parse common time formats
      try {
        const timeParts = this.time.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutesStr = timeParts[2];
          const minutes = parseInt(minutesStr);
          const meridiem = timeParts[3]?.toLowerCase();

          // Validate minutes are in range 0–59
          if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            return next(
              new Error('Invalid time format. Use HH:MM or HH:MM AM/PM'),
            );
          }

          // Validate hours based on meridiem presence
          if (meridiem) {
            // If AM/PM is present, hours must be 1–12
            if (isNaN(hours) || hours < 1 || hours > 12) {
              return next(
                new Error('Invalid time format. Use HH:MM or HH:MM AM/PM'),
              );
            }
          } else {
            // If no AM/PM, hours must be 0–23
            if (isNaN(hours) || hours < 0 || hours > 23) {
              return next(
                new Error('Invalid time format. Use HH:MM or HH:MM AM/PM'),
              );
            }
          }

          if (meridiem === 'pm' && hours !== 12) hours += 12;
          if (meridiem === 'am' && hours === 12) hours = 0;

          this.time = `${hours.toString().padStart(2, '0')}:${minutesStr}`;
        } else {
          return next(
            new Error('Invalid time format. Use HH:MM or HH:MM AM/PM'),
          );
        }
      } catch (error) {
        return next(new Error('Invalid time format. Use HH:MM or HH:MM AM/PM'));
      }
    }
  }

  next();
});

// Create unique index on slug for fast lookups and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

// Prevent model recompilation in development (Next.js hot reload)
const Event: Model<IEvent> =
  models.Event || model<IEvent>('Event', EventSchema);

export default Event;
