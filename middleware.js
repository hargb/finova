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
    shield({
      mode: "LIVE",
    }),

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
// Next.js Middleware Configuration
// -----------------------------

export const config = {
  runtime: "nodejs",

  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    "/(api|trpc)(.*)",

    "/__clerk/(.*)",
  ],
};