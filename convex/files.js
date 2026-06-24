import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyIdentity } from "./auth.helpers";

// Step A: Generates a short-lived secure upload landing destination URL
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await verifyIdentity(args.token);
    return await ctx.storage.generateUploadUrl();
  },
});

// Step B: Converts the internal storage ID string into a permanent web image link
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});


export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    // This uses Convex's native storage driver to get the correct public URL string
    return await ctx.storage.getUrl(args.storageId);
  },
});