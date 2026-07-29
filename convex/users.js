import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { verifyIdentity } from "./auth.helpers";

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


export const getById = query({
  args: { id: v.optional(v.string()) }, // Accept standard string from Next.js JWT payload
  handler: async (ctx, args) => {
    if (!args.id) { return null; }
    // Safely cast string back into a strict Convex ID object
    console.log("args.id", args.id);
    const normalizedId = ctx.db.normalizeId("users", args.id);
    console.log("normalizedId", normalizedId);
    if (!normalizedId) {
      return null;
    }
    
    return await ctx.db.get(normalizedId);
  },
});


export const completeOnboarding = mutation ({
      args: {
        token: v.string(),
        location: v.object ({
           // Allows string, null, or completely omitted (undefined)
          city: v.optional(v.union(v.string(), v.null())),
          state: v.optional(v.union(v.string(), v.null())),
          country: v.string(),
        }),
        interests: v.array(v.string()), // Min 3 categories
      }, 
      handler: async (ctx, args)=> {
         const rawUserId = await verifyIdentity(args.token);
         const userId = ctx.db.normalizeId("users", rawUserId);
         if (!userId) throw new Error("?Must be logged to complete onboarding?");


        await ctx.db.patch(userId, {
          hasCompletedOnboarding: true,
          location: args.location,
          interests: args.interests,
          updatedAt: Date.now(),
        })
        return { success: true, message: "Onboarding completed successfully" };
      }
})

