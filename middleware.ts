import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const clerk = clerkMiddleware();

export default async function middleware(request: Request, event: any) {
  const nextRequest =
    request instanceof NextRequest
      ? request
      : new NextRequest(request);

  return clerk(nextRequest, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
  runtime: "nodejs",
};