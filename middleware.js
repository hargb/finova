import { authMiddleware } from "@clerk/nextjs";
import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Arcjet setup
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Clerk setup for Edge Middleware
const clerk = authMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],

  afterAuth(auth, req) {
    if (!auth.userId && isProtectedRoute(req)) {
      return auth.redirectToSignIn();
    }
    return NextResponse.next();
  },
});

// Combine Arcjet + Clerk
export default createMiddleware(aj, clerk);

// Config for Next.js matcher
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
