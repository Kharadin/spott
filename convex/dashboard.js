import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const getEventDashboard = query ({
    args: { eventId: v.id("events") }, 
    handler: async (ctx, args) => {
       const user = await ctx.runQuery(internal.users.getCurrentUser);

       if (!user) {
        throw new Error ("User not found");
       }
       const event  = await ctx.db.get(args.eventId)
       if (!event) {
        throw new Error ("Event not found");
       }

       // check if the user is the organizer 
       if (event.organizerId !== user._id) {
        throw new Error ("You are not the organizer of this event");
       }

       // get all registrations
       const registrations = await ctx.db
          .query("registrations")
          .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
          .collect();
       
        // calculate stats
        const totalRegistrations = registrations.filter
          ((r) => r.status === "confirmed").length;

        const checkedInCount = registrations.filter
            ((r)=> r.checkedIn && r.status === "confirmed").length;

        const pendingCount = totalRegistrations - checkedInCount;
       
        // calculate revenue for paid events 
        let totalRevenue =0
        if (event.ticketType == "paid" && event.ticketPrice ) {
            totalRevenue = checkedInCount * event.ticketPrice
        }
        // calculate chech-in rate
        const checkInRate = 
            totalRegistrations > 0 ?
                Math.round((checkedInCount / totalRegistrations) * 100) : 0;
        // calculate time until event
        const now = Date.now();
        const timeUntilEvent = event.startDate - now;
        const hoursUntilEvent = Math.max(0,
             Math.floor(timeUntilEvent / (1000 * 60 * 60)));

        const today = new Date().setHours(0,0,0,0);
        const startDay = new Date(event.startDate).setHours(0,0,0,0);
        const endDate = new Date(event.endDate).setHours(0,0,0,0);
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
        }
       
    }
})

// Delete event
export const deleteEvent = mutation ({
    args: {eventId: v.id("events")},
    handler: async (ctx, args) =>  {
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        const event = await ctx.db.get(args.eventId);
        if (!event) {
            throw new Error ("Event not found")
        }

        //  Check if the user is the organizer. 
       if (event.organizerId !== user._id) {
        throw new Error ("You are not authorized to delete this event")
        } 
        // Delete the registrations first

        const registrations = await ctx.db
        .query("registrations")
        .withIndex("by_event", (q)=> q.eq("eventId", args.eventId))
        .collect();
        for (const reg of registrations) {
            await ctx.db.delete(reg._id);
        }
        // Delete the event
        await ctx.db.delete(args.eventId);
        if (user.freeEventsCreated > 0) {
            await ctx.db.patch(user._id, {
                freeEventsCreated: user.freeEventsCreated - 1   
            })
        }

        return {success: true};
    }
})