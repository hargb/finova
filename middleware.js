import arcjet, {
  createMiddleware,
  detectBot,
  shield,
} from "@arcjet/next";

import { clerkMiddleware } from "@clerk/nextjs/server";

// -----------------------------
// Arcjet Security Middleware
// -----------------------------

const aj = arcjet({
  key: process.env.ARCJET_KEY,

  rules: [
    // Protect against common application attacks
    shield({
      mode: "LIVE",
    }),

    // Bot protection
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "GO_HTTP",
      ],
    }),
  ],
});

// -----------------------------
// Clerk Authentication Middleware
// -----------------------------

const clerk = clerkMiddleware();

// -----------------------------
// Combine Arcjet + Clerk
// -----------------------------

export default createMiddleware(aj, clerk);

// -----------------------------
// Next.js Middleware Matcher
// -----------------------------

export const config = {
  matcher: [
    // Run middleware on application routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};