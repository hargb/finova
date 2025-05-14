import { withClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";

const isProtectedRoute = (pathname) => {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/transaction")
  );
};

const clerk = withClerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;

  if (!auth().userId && isProtectedRoute(pathname)) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
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

// Combine
export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
