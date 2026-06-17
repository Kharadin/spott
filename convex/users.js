import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const store = mutation({
    args: {},
    handler: async (ctx) => { 
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
          throw new Error("Called store without authentication present");    }

      
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier),
          )
          .unique();
        if (user !== null) {
          // If we've seen this identity before but the name has changed, patch the value.
            const updates = {};
            if (user.name !== identity.name) {
              updates.name = identity.name ?? "Anonymous";
            }
            if (user.email !== identity.email) {
              updates.email = identity.email ?? "";
            }
            if (user.imageUrl !== identity.pictureUrl) {
              updates.imageUrl = identity.pictureUrl;
            }

            if (Object.keys(updates).length > 0) {
              updates.updatedAt = Date.now();
              await ctx.db.patch(user._id, updates);
            }
          return user._id;
        }
        // If it's a new identity, create a new `User`.
        return await ctx.db.insert("users", {
          name: identity.name ?? "Anonymous",
          tokenIdentifier: identity.tokenIdentifier,
          email: identity.email ?? "",
          imageUrl: identity.pictureUrl ?? "",
          hasCompletedOnboarding: false,
          freeEventsCreated: 0, 
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
    }
//   ),
});

// 1. Create a helper function (not a query/ mutation)

// async function getAuthUser(ctx) {
//   const identity = await ctx.auth.getUserIdentity();
//   if (!identity) return null

 
//   return await ctx.db
//     .query("users")
//     .withIndex("by_token", (q) =>
//       q.eq("tokenIdentifier", identity.tokenIdentifier)
//     )
//     .unique();
// }


// 2. Simplify getCurrentUser to use the hepler 

// export const getCurrentUser = query({
//     handler: async (ctx) => {
//       return await getAuthUser(ctx);
//     }
// })

export const completeOnboarding = mutation ({
      args: {
        location: v.object ({
           // Allows string, null, or completely omitted (undefined)
          city: v.optional(v.union(v.string(), v.null())),
          state: v.optional(v.union(v.string(), v.null())),
          country: v.string(),
        }),
        interests: v.array(v.string()), // Min 3 categories
      }, 
      handler: async (ctx, args)=> {
         const user = await getAuthUser(ctx);

         if (!user) throw new Error("?Must be logged to complete onboarding?");

        await ctx.db.patch(user._id, {
          hasCompletedOnboarding: true,
          location: args.location,
          interests: args.interests,
          updatedAt: Date.now(),
        })
        return user._id
      }
})

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
