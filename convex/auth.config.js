export default {
  providers: [
    {
        // Configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
     // using your Clerk Issuer URL from your "convex" JWT template
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ]
} 