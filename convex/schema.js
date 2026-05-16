import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
  // Users table
  users: defineTable({
    // Clerk auth
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk user ID for auth
    name: v.string(),
    imageUrl: v.optional(v.string()),

    // Onboarding
    hasCompletedOnboarding: v.boolean(),

    // Attendee preferences (from onboarding)
    location: v.optional(
      v.object({
        city: v.string(),
        state: v.optional(v.string()), // Added state field
        country: v.string(),
      })
    ),
    interests: v.optional(v.array(v.string())), // Min 3 categories

    // Organizer tracking (User Subscription)
    freeEventsCreated: v.number(), // Track free event limit (1 free)

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]), // Primary auth lookup

  // Events table
  events: defineTable({
    title: v.string(),
    description: v.string(),
    slug: v.string(),

    // Organizer
    organizerId: v.id("users"),
    organizerName: v.string(),

    // Event details
    category: v.string(),
    tags: v.array(v.string()),

    // Date & Time
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    // Location
    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()), // Added state field
    country: v.string(),

    // Capacity & Ticketing
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()), // Paid at event offline
    registrationCount: v.number(),

    // Customization
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    
    //Status
    reviewed: v.optional(v.boolean()),
    published: v.optional(v.boolean()),
    cancelled: v.optional(v.boolean()),
    statusText: v.optional(v.string()),
   
    // AdPrice
    adPrice: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    featuredOrder: v.optional(v.number()),

    picXposition: v.optional(v.number()),
    picYposition: v.optional(v.number()),

  })
    .index("by_organizer", ["organizerId"])
    .index("by_category_published_start_date", ["category", "published", "startDate"])
    .index("by_start_date", ["startDate"])
    .index("by_slug", ["slug"])
    .index("by_featured_order", ["featuredOrder"])
    // .index("by_start_date_featured_order", ["startDate", "featuredOrder"])
    .index("by_city_published_start_date", ["city",  "published", "startDate"])
    .index("by_state_published_start_date", ["state", "published", "startDate"])
    .index("by_featured_start_date", ["featured", "startDate"])
    .index("by_published", ["published"])
    .index("by_organizer_reviewed_published", ["organizerId", "reviewed", "published"])
    .index("by_published_start_date", ["published", "startDate"]) 

    .searchIndex("search_title", { searchField: "title" }),

  // Registrations/Tickets
  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),

    // Attendee info
    attendeeName: v.string(),
    attendeeEmail: v.string(),

    // QR Code for entry
    qrCode: v.string(), // Unique ID for QR

    // Check-in
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),

    // Status
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),

    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_qr_code", ["qrCode"]),
});
