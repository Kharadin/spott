import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyIdentity } from "./auth.helpers";

export const getEventDashboard = query({
  // 1. Unified Argument Blueprint: token is listed first
  args: { 
    token: v.string(),
    eventId: v.id("events")
  }, 
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 2. Cast incoming string into a valid Convex internal format
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user identity profile");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User profile record not found");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if the user is the organizer 
    console.log(event.organizerId, user._id, user.role)
    if (user.role !== "admin" && event.organizerId !== user._id) {
      throw new Error("You are not the organizer of this event / admin");
    }

    // Get all registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    // Calculate stats
    const totalRegistrations = registrations.filter(
      (r) => r.status === "confirmed"
    ).length;

    const checkedInCount = registrations.filter(
      (r) => r.checkedIn && r.status === "confirmed"
    ).length;

    const pendingCount = totalRegistrations - checkedInCount;
   
    // Calculate revenue for paid events 
    let totalRevenue = 0;
    if (event.ticketType === "paid" && event.ticketPrice) {
      totalRevenue = checkedInCount * event.ticketPrice;
    }

    // Calculate check-in rate
    const checkInRate = 
      totalRegistrations > 0 ?
        Math.round((checkedInCount / totalRegistrations) * 100) : 0;

    // Calculate time until event
    const now = Date.now();
    const timeUntilEvent = event.startDate - now;
    const hoursUntilEvent = Math.max(0, Math.floor(timeUntilEvent / (1000 * 60 * 60)));

    const today = new Date().setHours(0, 0, 0, 0);
    const startDay = new Date(event.startDate).setHours(0, 0, 0, 0);
    const endDate = new Date(event.endDate).setHours(0, 0, 0, 0);
    const isEventToday = today >= startDay && today <= endDate;

    const isEventPast = event.endDate < now;

    return {
      event,
      stats: {
        totalRegistrations,
        checkedInCount,
        pendingCount,
        capacity: event.capacity,
        checkInRate,
        totalRevenue,
        hoursUntilEvent,
        isEventToday,
        isEventPast
      }
    };
  }
});

// Delete event
export const deleteEvent = mutation({
  // 1. Unified Argument Blueprint: token is listed first
  args: {
    token: v.string(),
    eventId: v.id("events")
  },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // 2. Cast user ID string safely
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user authentication credentials");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User identity profile not found");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if the user is the organizer. 
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to delete this event");
    } 

    // Delete the registrations first
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const reg of registrations) {
      await ctx.db.delete(reg._id);
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    // Track user allowance limits safely
    if (user.freeEventsCreated > 0) {
      await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated - 1   
      });
    }

    return { success: true };
  }
});
