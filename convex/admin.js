// convex/admin.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkAdminStatus, verifyIdentity } from "./auth.helpers";


// Reusable counter modifier helper
export async function txUpdateCounter(ctx, category, amount) {
  const counter = await ctx.db
    .query("categoryCounts")
    .withIndex("by_category", (q) => q.eq("category", category))
    .unique();

  if (counter) {
    const newCount = Math.max(0, counter.count + amount);
    await ctx.db.patch(counter._id, { count: newCount });
  } else if (amount > 0) {
    await ctx.db.insert("categoryCounts", { category, count: amount });
  }
} 

// 1. Toggle Review Status
export const toggleReviewEvent = mutation({
  args: { token: v.string(),
    id: v.id("events"), review: v.boolean() },
  handler: async (ctx, args) => {
    const rawUserId = await verifyIdentity(args.token);
    // NOrmalize string into a strict Convex ID object
    const userId = ctx.db.normalizeId("users", rawUserId);
    await checkAdminStatus(ctx, userId );
    await ctx.db.patch(args.id, { reviewed: args.review });
  }
});

// 2. Toggle Publish Status (Accounts for cancellation status)
export const togglePublishEvent = mutation({
  args: { token: v.string(),
    id: v.id("events"), publish: v.boolean() },
  handler: async (ctx, args) => {
     const rawUserId = await verifyIdentity(args.token);
     // NOrmalize string into a strict Convex ID object
    const userId = ctx.db.normalizeId("users", rawUserId);
    await checkAdminStatus(ctx, userId );

    const event = await ctx.db.get(args.id);
    if (!event || !!event.published === args.publish) return;

    await ctx.db.patch(args.id, { published: args.publish });

    // Only modify numbers if the event isn't currently cancelled
    if (!event.cancelled) {
      const changeAmount = args.publish ? 1 : -1;
      await txUpdateCounter(ctx, event.category, changeAmount);
      console.log(`Category ${event.category} count updated by ${changeAmount}`);
      console.log(`New count: ${(await ctx.db.query("categoryCounts").withIndex("by_category", (q) => q.eq("category", event.category)).unique()).count}`);
    }
  },
});

// 3. Toggle Cancelled Status (Updates category counters dynamically)
export const toggleCancelEvent = mutation({
  args: { token: v.string(),
    id: v.id("events"), cancel: v.boolean() },
  handler: async (ctx, args) => {
     const rawUserId = await verifyIdentity(args.token);
     // NOrmalize string into a strict Convex ID object
    const userId = ctx.db.normalizeId("users", rawUserId);
    await checkAdminStatus(ctx, userId );

    const event = await ctx.db.get(args.id);
    if (!event || !!event.cancelled === args.cancel) return;

    await ctx.db.patch(args.id, { cancelled: args.cancel });

    // Cancelled events drop from counts; Uncancelled ones return (if published)
    if (event.published) {
      const changeAmount = args.cancel ? -1 : 1;
      await txUpdateCounter(ctx, event.category, changeAmount);
    }
  },
});

// Admin-only mutation to delete an event
export const adminDeleteEvent = mutation({
  args: {
    token: v.string(), id: v.id("events") },
  handler: async (ctx, args) => {
     const rawUserId = await verifyIdentity(args.token);
     // NOrmalize string into a strict Convex ID object
    const userId = ctx.db.normalizeId("users", rawUserId);
    await checkAdminStatus(ctx, userId );

    const event = await ctx.db.get(args.id);
    if (!event) return;

    await ctx.db.delete(args.id);

    // If it was live, remove it from the category aggregate count
    if (event.published && !event.cancelled) {
      await txUpdateCounter(ctx, event.category, -1);
    }
  },
});

export const getAdminEventsPage = query({
  args: {
    token: v.string(),
    skipCount: v.number(),
    limit: v.number(),
    showPast: v.boolean(),
    selectedDate: v.number(),
    timelineFilterField: v.union(v.literal("startDate"), v.literal("endDate")),
  },
  handler: async (ctx, args) => {
     const rawUserId = await verifyIdentity(args.token);
     // NOrmalize string into a strict Convex ID object
    const userId = ctx.db.normalizeId("users", rawUserId);
    await checkAdminStatus(ctx, userId );

    let dbQuery;

    // ⚡ STEP 1: Branch on the field strategy so Convex reads literal strings
    if (args.timelineFilterField === "startDate") {
      dbQuery = ctx.db.query("events").withIndex("by_start_date", (q) =>
        args.showPast
          ? q.lt("startDate", args.selectedDate)   // Database-level historic scan
          : q.gte("startDate", args.selectedDate)  // Database-level future scan
      );
    } else {
      dbQuery = ctx.db.query("events").withIndex("by_end_date", (q) =>
        args.showPast
          ? q.lt("endDate", args.selectedDate)     // Database-level historic scan
          : q.gte("endDate", args.selectedDate)    // Database-level future scan
      );
    }

    // ⚡ STEP 2: Execute the optimized index query plan
    const filteredEvents = await dbQuery.collect();

    const totalCount = filteredEvents.length;
    const pageItems = filteredEvents.slice(args.skipCount, args.skipCount + args.limit);

    return {
      events: pageItems,
      hasMore: args.skipCount + args.limit < totalCount,
      totalCount,
    };
  },
});

