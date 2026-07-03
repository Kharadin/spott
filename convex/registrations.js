import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { verifyIdentity } from "./auth.helpers";


const generateQRCode = () => {
    // Generate QR code
    return `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}


export const registerForEvent = mutation({
  args: {
    // 1. Unified Argument Blueprint: token listed first
    token: v.string(),
    eventId: v.id("events"),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 2. Safely cast the string ID into a valid Convex Document ID
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user identity format");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Not authenticated");
    }
      
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if event is full
    if (event.registrationCount >= event.capacity) {
      throw new Error("Event is full");
    }

    // 3. Fixed index lookup to pass the cleanly formatted internal ID object
    const existingRegistration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      ) 
      .unique();

    if (existingRegistration) {
      throw new Error("You are already registered for this event");
    }

    // Note: Ensure generateQRCode() is imported/defined in this file
    const QRCode = generateQRCode(); 
    
    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId: user._id, // Saved as your strongly-typed foreign key object
      attendeeName: args.attendeeName,
      attendeeEmail: args.attendeeEmail,
      qrCode: QRCode,
      checkedIn: false,
      status: "confirmed",
      registeredAt: Date.now(),
    });

    // Update event registration count
    await ctx.db.patch(args.eventId, {
      registrationCount: event.registrationCount + 1   
    });

    return registrationId;
  }  
});


export const checkRegistration = query({
  args: { 
    eventId: v.id("events"),          // Strictly required to execute the query
    token: v.optional(v.string())     // Optional for unauthenticated visitors
  },
  handler: async (ctx, args) => {
    // 1. If no token is provided, they are not registered. Return null safely.
    if (!args.token) {
      return null; 
    }

    try {
      const rawUserId = await verifyIdentity(args.token);
      
      const userId = ctx.db.normalizeId("users", rawUserId);
      if (!userId) return null;

      const registration = await ctx.db
        .query("registrations")
        .withIndex("by_event_user", (q) =>
          q.eq("eventId", args.eventId).eq("userId", userId)  
        )
        .unique();

      return registration;
    } catch (error) {
      console.error("Auth error in checkRegistration:", error.message);
      return null;
    }
  }
});



export const getMyRegistrations = query({
  args: { 
    token: v.string() 
  },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 1. Safely cast the string ID into a valid Convex Document ID
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) return [];

    // 2. Query registrations using the normalized ID directly
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect(); 

    // 3. Fetch associated events in parallel
    const registrationsWithEvents = await Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return { ...reg, event };
      })
    );

    return registrationsWithEvents;
  }
});

export const cancelRegistration = mutation({
  args: { 
    // 1. Unified Argument Blueprint: token listed first
    token: v.string(),
    registrationId: v.id("registrations") 
  },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 2. Safely cast the string ID into a valid Convex Document ID
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user identity format");
    }

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // 3. Securely compare with the normalized ID object directly
    if (registration.userId !== userId) {
      throw new Error("You can cancel only your own registrations");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Update registration status
    await ctx.db.patch(args.registrationId, {
      status: "cancelled",
    });

    // Decrement event registration count
    if (event.registrationCount > 0) {
      await ctx.db.patch(registration.eventId, {
        registrationCount: event.registrationCount - 1 
      }); 
    }      

    return { success: true };
  }
});

export const checkInAttendee = mutation({
  args: { 
    // 1. Unified Argument Blueprint: token listed first
    token: v.string(),
    qrCode: v.string() 
  },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 2. Safely cast the string ID into a valid Convex Document ID
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user identity format");
    }

    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();

    if (!registration) {
      throw new Error("QR code not found");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }


    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User profile record not found");
    }

    // 3. Check if the scanning user is the organizer using the normalized ID
    if (event.organizerId !== userId && user.role !== "admin") {
      throw new Error("You are not authorized to check in attendees for this event");
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return {
        success: false,
        message: "Already checked in",
        registration,
      };
    }

    const now = Date.now();

    // Execute check-in
    await ctx.db.patch(registration._id, {
      checkedIn: true,
      checkedInAt: now,
    });

    return {
      success: true,
      message: "Check-in successful",
      registration: {
        ...registration, 
        checkedIn: true,
        checkedInAt: now
      }
    };
  }
});


export const getEventRegistrations = query({
  args: { 
    // 1. Unified Argument Blueprint: token listed first
    token: v.string(),
    eventId: v.id("events") 
  },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 2. Safely cast the string ID into a valid Convex Document ID
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user identity format");
    }
     const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User profile record not found");
    }


    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // 3. Check if the viewing user is the actual organizer using the normalized ID
    if ( user.role !== "admin" && event.organizerId !== userId ) {
      throw new Error("You are not the organizer of this event");
    }
    
    // 4. Fetch registrations linked to the event
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return registrations;
  }
});
