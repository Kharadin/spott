import { internal } from "./_generated/api";

export async function checkAdminStatus (ctx) {
    // 1 Reuse your method to get the logged-in user document
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    if (!user) {throw new Error ("User not logged in")} ;

    // 2 Add the role verification check
    if (user.role !=="admin") {throw new Error ("Admin role required")}

    return user
    

}