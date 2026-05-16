import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateEvents = mutation({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.patch(event._id, {
        reviewed: true,
        published: true,
        cancelled: false,
        adPrice: 0,
        // statusText is optional, so no need to patch unless you want to
      });
    }
  },
});


export const writeFeaturedBooleans = mutation({
  handler: async (ctx) => {
    const featuredEvents = await ctx.db.query("events")
    .withIndex("by_featured_order", (q) => q.gt("featuredOrder", null))
    .collect();
    for (const event of featuredEvents) {
    //   if (event.featuredOrder !== undefined) {
            await ctx.db.patch(event._id, {
        featured: true,
        // statusText is optional, so no need to patch unless you want to
      });
      // }
    }
  
  
  },
});