import { jwtVerify } from "jose";

export async function verifyIdentity(token) {
  if (!token) {
    throw new Error("Unauthorized: Token missing");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (error) {
    throw new Error("Unauthorized: Invalid or expired token");
  }
}


/**
 * Helper to verify if a user has admin privileges.
 * @param {any} ctx - Convex context object
 * @param {string} userId - The internal Convex user ID
 */
export async function checkAdminStatus(ctx, userId) {
  if (!userId) {
    throw new Error("User not logged in");
  }

  // 1. Fetch the user directly from the database using their ID
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User profile not found");
  }

  // 2. Perform the role verification check
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }

  // Return the full user document so calling functions can use it if needed
  return user;
}
