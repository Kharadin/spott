import { mutation } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

// Verifies password using Node's crypto matching your salt:hash format
function verifyPassword(password, storedHash) {
  const parts = storedHash.split(":");
  const salt = parts[0];
  const key = parts[1];
  if (!salt || !key) return false;

  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
}

// Helper function to hash passwords securely using scrypt
function hashPassword(password) {
  // Generate a random 16-byte salt
  const salt = crypto.randomBytes(16).toString("hex");
  // Derive a 64-byte key using the salt
  const key = crypto.scryptSync(password, salt, 64).toString("hex");
  // Store them combined with a delimiter
  return `${salt}:${key}`;
}

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const genericError = { success: false, message: "Incorrect Email or Password" };

    // 1. User Lookup
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return genericError;
    }

    if (user.unsuccessAttempt >= 6) {
      return {
        success: false,
        message: "Your account is blocked. Please write to Admin",
      };
    }

    if (user.unsuccessAttempt >= 3 && user.unsuccessAttempt <= 5) {
      if (user.lastAttemptTime) {
        const timePassed = now - user.lastAttemptTime;
        if (timePassed <= 30000) {
          // Record Attempt Time to DB (Bot prevention route)
          await ctx.db.patch(user._id, { lastAttemptTime: now });
          return { success: false, message: "Wait 30 seconds" };
        }
      }
    }

    // 4. Password Verification (Flowchart: Password match?)
    const isMatch = verifyPassword(args.password, user.passwordHash);

    if (isMatch) {
      // Flowchart: Yes -> Set unsuccess Attempts = 0
      await ctx.db.patch(user._id, {
        unsuccessAttempt: 0,
        lastAttemptTime: undefined,
      });

      // Flowchart: Success output
      return {
        success: true,
        userId: user._id,
        tokenIdentifier: user.tokenIdentifier, // Returned to hook into old code cleanly
        message: "Login successful",
      };
    } else {
      // Flowchart: No -> Unsuccess Attempts ++
      const newAttempts = (user.unsuccessAttempt || 0) + 1;
      await ctx.db.patch(user._id, {
        unsuccessAttempt: newAttempts,
        lastAttemptTime: now,
      });

      // Flowchart check right after incrementing
      if (newAttempts >= 6) {
        return {
          success: false,
          message: "Your account is blocked. Please write to Admin",
        };
      }
      return genericError;
    }
  },
});

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const normalizedEmail = args.email.toLowerCase().trim();

    // 1. Check if the user email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // 2. Generate a secure, unique password hash
    const passwordHash = hashPassword(args.password);

    // 3. Create a unique fallback for the old Clerk 'tokenIdentifier'
    // We mix a static prefix with a random string to prevent old code from crashing.
    const uniqueId = crypto.randomBytes(12).toString("hex");
    const tokenIdentifier = `custom_auth|${uniqueId}`;

    // 4. Insert the new user into the database matching your exact schema
    const userId = await ctx.db.insert("users", {
      email: normalizedEmail,
      passwordHash: passwordHash,
      unsuccessAttempt: 0, // Initialized to 0
      tokenIdentifier: tokenIdentifier, // Populated for backward compatibility
      name: args.name,
      hasCompletedOnboarding: false, // Default onboarding state
      freeEventsCreated: 0, // Initialized counter
      createdAt: now,
      updatedAt: now,
    });

    // 5. Return success info to the Next.js frontend
    return {
      success: true,
      userId: userId,
      tokenIdentifier: tokenIdentifier,
      message: "Registration successful",
    };
  },
});
