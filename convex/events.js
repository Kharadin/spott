
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// ==========================================
// 1. REUSABLE DB LOGIC (PURE JAVASCRIPT HELPER)
// ==========================================
// Fast, local database reader. No nested query or auth overhead.
async function  checkUnreviewedOrUnpublised  (ctx, userId) {
        try {            
            // Fetch up to 3 unreviewed events.
            const unreviewedEvents = await ctx.db 
            .query("events")
            .withIndex("by_organizer_reviewed_published", (q)=>
                q.eq("organizerId", userId).eq("reviewed", false)
            )
            .take(3)

            // now, up to 3 unpublshed events
            const unpublishedEvents = await ctx.db 
                .query("events")
                .withIndex('by_organizer_reviewed_published', (q)=>
                q.eq("organizerId", userId).eq("reviewed", true).eq("published", false)
                )
                .take(3)
            
        // simple addition check, safe because records never overlap
        console.log(unreviewedEvents, unpublishedEvents)
        console.log(unreviewedEvents.length + unpublishedEvents.length >= 2)
        // return  true
        return  unreviewedEvents.length + unpublishedEvents.length >= 2 
        
        
        } catch (error) {
            console.log(error)
        }  
    
}
// 2. STANDALONE QUERY (FOR FRONTEND UI)
// ==========================================
export const checkLimitForCreateEvent = query ({
    args: {},
    handler: async (ctx) => {
        try {
            const user = await ctx.runQuery(internal.users.getCurrentUser);
            if (!user) throw new Error("Пользователь не авторизован");
            
            // Call the internal helper function    
            return await checkUnreviewedOrUnpublised(ctx, user._id)
        } catch (error) {
              // Safely pass only the text message to keep Convex types stable
                throw new Error(error instanceof Error ? error.message : String(error));
                // throw new Error(error.message );
        }
    }
})

export const createEvent = mutation ({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),
    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    // hasPro: v.optional(v.boolean()),

    }, 
    handler: async (ctx, args) => {
      
        try {
            const user = await ctx.runQuery(internal.users.getCurrentUser);
            if (!user) throw new Error("Пользователь не авторизован");
              
            // Reuse the local JS function directly 
            const isBlocked = await checkUnreviewedOrUnpublised(ctx, user._id);
            if (isBlocked) throw new Error("У вас уже есть 2 непроверенных/неоплаченных мероприятия.");

            const themeColor = args.themeColor
            // const themeColor = args.hasPro ? args.themeColor : defaultColor;
            // GENERATE SLUG from title
            const slug =    args.title
                .toLowerCase()  
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

        const eventId = await ctx.db.insert("events", { 
            ...args,
            themeColor,
            slug: `${slug}-${Date.now()}`,
            organizerId: user._id,
            organizerName: user.name,
            registrationCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            reviewed: false,
            published: false,
            cancelled: false

        });
       // Update users's free event count
       await ctx.db.patch(user._id, {
        freeEventsCreated: user.freeEventsCreated + 1
       })
        return await eventId;
        } catch (error) {
            throw new Error (`Failed to create event: ${error.message}`)
        }

    },

})

// Get event by slug
export const getEventBySlug = query ({
    args: {slug: v.string()},
    handler: async (ctx, args) => {
        const event = await ctx.db
        .query("events")
        .withIndex("by_slug", (q)=> q.eq("slug", args.slug))
        .unique();
        return event
    }
})

// Get Events by organizer
export const getMyEvents = query ({
    handler: async (ctx) => {
        const user=  await ctx.runQuery(internal.users.getCurrentUser)
        const events = await ctx.db
        .query("events")
        .withIndex("by_organizer", (q)=> q.eq("organizerId", user._id))
        .order("desc")
        .collect();
        return events
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

        // If user has some freeEventsCreated, then decrease their num by 1 (we did not even check it's a free event that's deleted, but Ok, it's learing material)
        if (user.freeEventsCreated > 0) {
            await ctx.db.patch(user._id, {
                freeEventsCreated: user.freeEventsCreated - 1   
            })
        }

        return {success: true};
    }
})

export const syncAllRegistrationCounts = mutation({
    args: {}, // No args needed to sync everything
    handler: async (ctx) => {
        // 1. Get all events
        const events = await ctx.db.query("events").collect();

        // 2. Map through each event to update its count
        for (const event of events) {
            const activeRegistrations = await ctx.db
                .query("registrations")
                .withIndex("by_event", (q) => q.eq("eventId", event._id))
                .filter((q) => q.neq(q.field("status"), "cancelled"))
                .collect();

            // 3. Update the specific event with the real count
            await ctx.db.patch(event._id, {
                registrationCount: activeRegistrations.length,
                // updatedAt: Date.now()
            });
        }

        return { updated: events.length };
    },
});
