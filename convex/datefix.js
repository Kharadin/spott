import { internalMutation } from "./_generated/server";

export const setMonthsToJune = internalMutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("events").collect();
    for (const doc of docs) {
      const updatedFields = {};

      if (doc.startDate !== undefined) {
        const date = new Date(doc.startDate);
        date.setMonth(5); // June (0-indexed)
        updatedFields.startDate = date.getTime();
      }

      if (doc.endDate !== undefined) {
        const date = new Date(doc.endDate);
        date.setMonth(5);
        updatedFields.endDate = date.getTime();
      }

      await ctx.db.patch(doc._id, updatedFields);
    }
  },
});