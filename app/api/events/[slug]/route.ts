import type { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { Event } from '@/database';
import connectDB from '@/lib/mongodb';

type RouteContext = {
  params: {
    slug: string;
  };
};

type ErrorResponse = {
  message: string;
  details?: string;
};

type EventLean = {
  _id: Types.ObjectId;
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
};

type EventResponse = Omit<EventLean, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

function jsonError(status: number, message: string, details?: string) {
  const body: ErrorResponse = {
    message,
    ...(details ? { details } : {}),
  };

  return NextResponse.json(body, { status });
}

function normalizeSlug(raw: string): string {
  // Defensively decode + normalize so we always query against the stored (lowercase) value.
  const decoded = decodeURIComponent(raw);
  return decoded.trim().toLowerCase();
}

function isValidSlug(slug: string): boolean {
  // Keep slug rules tight (matches what the schema generates).
  const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length > 0 && slug.length <= 120 && SLUG_REGEX.test(slug);
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const rawSlug = (await params).slug;

  if (rawSlug.trim().length === 0) {
    return jsonError(400, 'Missing required route parameter: slug');
  }

  let slug: string;
  try {
    slug = normalizeSlug(rawSlug);
  } catch {
    return jsonError(400, 'Invalid slug encoding');
  }

  if (!isValidSlug(slug)) {
    return jsonError(
      400,
      'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
    );
  }

  try {
    await connectDB();

    // Use lean() for a plain object result and better performance.
    const event = await Event.findOne({ slug })
      .select('-__v')
      .lean<EventLean>()
      .exec();

    if (!event) {
      return jsonError(404, 'Event not found');
    }

    // Ensure ObjectId and dates are JSON-friendly and stable across consumers.
    const responseEvent: EventResponse = {
      ...event,
      _id: event._id.toString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { message: 'Event fetched successfully', event: responseEvent },
      { status: 200 },
    );
  } catch (err: unknown) {
    const details =
      process.env.NODE_ENV === 'production'
        ? undefined
        : err instanceof Error
          ? err.message
          : 'Unknown error';

    return jsonError(500, 'Failed to fetch event', details);
  }
}
