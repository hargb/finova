import { withClerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";

// Protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const clerk = withClerkMiddleware((auth, req) => {
  if (!auth().userId && isProtectedRoute(req)) {
    return NextResponse.redirect("/sign-in");
  }
  return NextResponse.next();
});

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

// Combine arcjet + clerk
export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
