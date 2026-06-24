
import {api} from "./_generated/api";
import { mutation, query, action } from "./_generated/server";
import {  v } from "convex/values";
import {txUpdateCounter} from "./admin";
import { verifyIdentity } from "./auth.helpers";


// Helper function to safely increment and decrement category counts


// ==========================================
// 1. REUSABLE DB LOGIC (PURE JAVASCRIPT HELPER)
// ==========================================
// Fast, local database reader. No nested query or auth overhead.
async function  checkUnreviewedOrUnpublished  (ctx, userId) {
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

export const checkLimitForCreateEvent = query({
  args: { token: v.optional(v.string()) }, 
  handler: async (ctx, args) => {
    // If the token hasn't loaded yet, do not block the form yet
    if (!args.token) return false;

    try {
      const rawUserId = await verifyIdentity(args.token);
      const userId = ctx.db.normalizeId("users", rawUserId);
      if (!userId) return false;

      const user = await ctx.db.get(userId);
      if (!user) return false;
      
      // Return the real limit calculation result (true or false)
      return await checkUnreviewedOrUnpublished(ctx, user._id);
      
    } catch (error) {
      console.error("Auth error in checkLimitForCreateEvent:", error.message);
      return false; // Fallback safely to open if token check fails mid-request
    }
  }
});



export const createEvent = mutation({
  args: {
    token: v.string(), // Extracted first from your frontend context
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
  }, 
  handler: async (ctx, args) => {
    // 1. Destructure 'token' out, leaving all pure event fields inside 'eventDetails'
    const { token, ...eventDetails } = args;

    const rawUserId = await verifyIdentity(token);

    // 2. Safely cast the string ID into a valid Convex Document ID
    const userId = ctx.db.normalizeId("users", rawUserId);
    if (!userId) {
      throw new Error("Invalid user ID format");
    }

    try {
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("User profile not found");
      }

      // 3. Check for platform usage blocks
      const isBlocked = await checkUnreviewedOrUnpublished(ctx, user._id);
      if (isBlocked) {
        throw new Error("You already have 2 unreviewed or unpublished events.");
      }

      // 4. Generate URL slug from title securely
      const slug = eventDetails.title
        .toLowerCase()  
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");


          // 1. Establish your fallback brand default color
      const defaultColor = "#3b82f6"; // e.g., a nice clean Tailwind blue
      const themeColor = eventDetails.themeColor || defaultColor;

      // 5. Database Insertion (using safe eventDetails instead of raw ...args)
      const eventId = await ctx.db.insert("events", { 
        ...eventDetails, // Contains title, description, capacity, etc. (No raw userId string!)
        themeColor, // overwrite with safe themeColor
        slug: `${slug}-${Date.now()}`,
        organizerId: user._id, // Saved as your strongly-typed foreign key object
        organizerName: user.name,
        registrationCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        reviewed: false,
        published: false,
        cancelled: false
      });
   
      // 6. Async side-tasks
      await ctx.scheduler.runAfter(0, api.events.sendAdminNotification, { 
        eventTitle: eventDetails.title 
      });

      return eventId;
    } catch (error) {
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

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
export const getMyEvents = query({
  // Accept an optional or empty token string to prevent validation crashes
  args: { token: v.optional(v.string()) }, 
  handler: async (ctx, args) => {
    // 1. If token isn't provided yet, return empty list instead of crashing
    if (!args.token) {
      return []; 
    }

    try {
      const rawUserId = await verifyIdentity(args.token);
      
      // 2. Safely cast the string ID into a valid Convex Document ID
      const userId = ctx.db.normalizeId("users", rawUserId);
      if (!userId) {
        return []; // Return empty if user doesn't exist in DB
      }   

      // 3. Fetch events
      const events = await ctx.db
        .query("events")
        .withIndex("by_organizer", (q) => q.eq("organizerId", userId))
        .order("desc")
        .collect();

      return events;
    } catch (error) {
      // Catch JWT expiration or invalid errors gracefully
      console.error("Auth error in getMyEvents:", error.message);
      return []; 
    }
  }
});
// Delete event
export const deleteEvent = mutation ({
    args: {token: v.string(),
        eventId: v.id("events")},
    handler: async (ctx, args) =>  {
      const rawUserId = await verifyIdentity(args.token);
           // 2. Safely cast the string ID into a valid Convex Document ID
      const userId = ctx.db.normalizeId("users", rawUserId);
      if (!userId) {
        throw new Error("Invalid user ID format");
      }   

        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error ("User identity profile not found")
        }
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

        // Update the category count (if published)
        if (event.published) {
        await txUpdateCounter(ctx, event.category, -1); }

        // If user has some freeEventsCreated, then decrease their num by 1 (I: we did not even check it's a free event that's deleted, but Ok, it's learing material)
        if (user.freeEventsCreated > 0) {
            await ctx.db.patch(user._id, {
                freeEventsCreated: user.freeEventsCreated - 1   
            })
        }
        return {success: true};
    }
})

export const sendAdminNotification = action ({
    args: {eventTitle: v.string()},
    handler: async (ctx, args) => {
        const resendKey  = process.env.RESEND_API_KEY;

        await fetch ("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Spott Alerts <onboarding@resend.dev>", 
                to: "dmitry.kharadin@gmail.com",
                subject: "New event created",
                html: `<p> New event created: <strong>${args.eventTitle}</strong></p>`
            })
        })
        console.log("Admin notification sent");
    }
})


// 3. Update an Event (Handles category shifts) Looks Ok.
export const updateEventCategory = mutation({
  args: { id: v.id("events"), newCategory: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event || event.category === args.newCategory) return;

    const oldCategory = event.category;
    
    await ctx.db.patch(args.id, { category: args.newCategory });

    await txUpdateCounter(ctx, oldCategory, -1);
    await txUpdateCounter(ctx, args.newCategory, 1);
  },
});

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

// convex/events.js

export const backfillCategoryCounts = mutation({
  args: {},
  handler: async (ctx) => {

     const now = Date.now();
    // 1. Fetch all existing events
    const allEvents = await ctx.db.query("events")
    .withIndex("by_published_end_date", (q) => q.eq("published", true).gte("endDate", now))
    .collect();

    // 2. Aggregate the counts in memory
    const counts = {};
    allEvents.forEach((event) => {
      if (event.category) {
        counts[event.category] = (counts[event.category] || 0) + 1;
      }
    });

    // 3. Clear out any existing data in the tracker table to prevent duplicates
    const existingCounters = await ctx.db.query("categoryCounts").collect();
    for (const counter of existingCounters) {
      await ctx.db.delete(counter._id);
    }

    // 4. Insert the fresh, accurate counts into the table

    //                             Object.entries(counts)- takes our object of key-value pairs and turns it into an array (of arrays)
    // const [category, count] 0f .... takes these arrays (one by 1) and Destrucrures the category into categry varible and count into count
    for (const [category, count] of Object.entries(counts)) {
      await ctx.db.insert("categoryCounts", { category, count }); // shourt form
    }

    return { message: "Backfill complete!", dynamicCountsComputed: counts };
  },
});
