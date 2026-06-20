import { mutation } from "./_generated/server";
import { v } from "convex/values";


// Helper: Convert a hex string back into a Uint8Array
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Helper: Convert a Uint8Array or ArrayBuffer into a hex string
function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Deterministic Web Crypto PBKDF2 Password Hashing
async function hashPasswordWebCrypto(password, saltHex) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const saltBytes = hexToBytes(saltHex);

  // Import raw password text into a crypto key object
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive a secure 64-byte key using 100,000 iterations of SHA-256
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    512 // 64 bytes * 8 bits
  );

  return bytesToHex(derivedBits);
}

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now(); // Deterministic in Convex
    const genericError = { success: false, message: "Incorrect Email or Password" };

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) return genericError;

    if (user.unsuccessAttempt >= 6) {
      return { success: false, message: "Your account is blocked. Please write to Admin" };
    }

    if (user.unsuccessAttempt >= 3 && user.unsuccessAttempt <= 5) {
      if (user.lastAttemptTime) {
        const timePassed = now - user.lastAttemptTime;
        if (timePassed <= 30000) {
          await ctx.db.patch(user._id, { lastAttemptTime: now });
          return { success: false, message: "Wait 30 seconds" };
        }
      }
    }

    // Parse out stored salt and hash
    const parts = user.passwordHash.split(":");
    const salt = parts[0];
    const storedHash = parts[1];
    if (!salt || !storedHash) return genericError;

    // Verify password using the extracted salt
    const calculatedHash = await hashPasswordWebCrypto(args.password, salt);
    const isMatch = calculatedHash === storedHash;

    if (isMatch) {
      await ctx.db.patch(user._id, {
        unsuccessAttempt: 0,
        lastAttemptTime: undefined,
      });

      return {
        success: true,
        userId: user._id,
        tokenIdentifier: user.tokenIdentifier,
        message: "Login successful",
      };
    } else {
      const newAttempts = (user.unsuccessAttempt || 0) + 1;
      await ctx.db.patch(user._id, {
        unsuccessAttempt: newAttempts,
        lastAttemptTime: now,
      });

      if (newAttempts >= 6) {
        return { success: false, message: "Your account is blocked. Please write to Admin" };
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

    // 1. SECURE BACKEND VALIDATION (Returns "success: false" to match your frontend)
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { success: false, message: "A valid email address is required." };
    }
    if (!args.password || args.password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }
    if (!args.name || !args.name.trim()) {
      return { success: false, message: "Name field cannot be blank." };
    }

       // 2. Check if the user email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // To preserve determinism, we use Convex's seeded Math.random()
    // instead of randomBytes to generate our unique strings.
    const generateRandomHex = (len) => {
      let hex = "";
      while (hex.length < len) {
        hex += Math.random().toString(16).substring(2);
      }
      return hex.substring(0, len);
    };

    const salt = generateRandomHex(32); // 16 bytes
    const derivedHash = await hashPasswordWebCrypto(args.password, salt);
    const passwordHash = `${salt}:${derivedHash}`;

    const uniqueId = generateRandomHex(24); // 12 bytes
    const tokenIdentifier = `custom_auth|${uniqueId}`;
    
    // 4. Insert the new user safely
    const userId = await ctx.db.insert("users", {
      email: normalizedEmail,
      passwordHash: passwordHash,
      unsuccessAttempt: 0,
      tokenIdentifier: tokenIdentifier,
      name: args.name,
      hasCompletedOnboarding: false,
      freeEventsCreated: 0,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      userId: userId,
      tokenIdentifier: tokenIdentifier,
      message: "Registration successful",
    };
  },
});
