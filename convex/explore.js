import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFeaturedEvents = query( {
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const events = await ctx.db
        .query("events")
        .withIndex("by_featured_start_date",
             (q) => q.eq("featured", true).gte("startDate", now)
        )
        .collect();
        

        // (Sort by registration count), Now sort by featuredOrder
        const featured = events
            .sort((a, b) => b.featuredOrder - a.featuredOrder)
            // .slice(0, 7)
                // .sort ((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, args.limit ?? 5)
        
        return featured
    }
});

// Get events by location: city, state.
export const getEventsByLocation= query ({
    args: {
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args)=>{
        const now = Date.now();

        if (args.city){
            
            let events = await ctx.db
            .query("events")
            .withIndex("by_city_published_start_date", (q)=> q
            .eq("city", args.city)
            .eq("published", true)
            .gte("startDate", now))
            
            .collect();

            // and we would need additionally to filter by state (in case same name of city across states)
            if (args.state){
                events = events.filter(
                    (e) => e.state.toLowerCase() === args.state.toLowerCase()
                )
            }
             return events.slice(0, args.limit ?? 4)
        }

        // in other case (only state) then we search only by state
        if (!args.city){
            let events = await ctx.db
            .query("events")
            .withIndex("by_state_published_start_date", (q)=> q
            .eq("state", args.state)
            .eq("published", true)
            .gte("startDate", now))
            .collect();

            return events.slice(0, args.limit ?? 4)
        }
       
    },


});

export const getPopularEvents = query ({
        args: {
      
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const resultLimit = args.limit ?? 20

        const upcomingEvents  = await ctx.db
        .query("events")
        .withIndex("by_published_start_date", (q) => q.eq("published", true).gte("startDate", now))
        .collect();

        // Sort by registration count in memory and slice
        const popular = upcomingEvents 
            .sort ((a, b) => b.registrationCount - a.registrationCount)
            .slice(0, resultLimit)

        return popular
    }
})
// Get  events by category
export const getEventsByCategory = query ({
    
    args: {
        category: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();


        // The database scans directly to the category -> published -> upcoming range
        const events = await ctx.db
        .query("events")
        .withIndex("by_category_published_start_date", (q) => q
            .eq("category", args.category)
            .eq("published", true)
            .gte("startDate", now)
          )   
        .collect();

        return events.slice(0, args.limit ?? 20);
    }
})

export const getCategoryCounts = query ({
    handler: async (ctx) => {
        const now = Date.now();

        const events = await ctx.db
        .query("events")
        .withIndex("by_start_date")
        .collect();
        // lets count events by category
        const counts = {};
        events.forEach((event) => {
            counts[event.category] = (counts[event.category] || 0) + 1;
            //"read-modify-write" cycle, code is write - read -modify
            
        });

        return counts;
    }
})


