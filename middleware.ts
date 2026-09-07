import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const clerk = clerkMiddleware();

export default async function middleware(request: Request, event: any) {
  const nextRequest =
    request instanceof NextRequest
      ? request
      : new NextRequest(request);

  console.log("CLERK WRAPPER DIAGNOSTIC:", {
    originalIsNextRequest: request instanceof NextRequest,
    convertedHasNextUrl: !!nextRequest.nextUrl,
    url: nextRequest.url,
    pathname: nextRequest.nextUrl.pathname,
  });

  return clerk(nextRequest, event);
}

export const config = {
  matcher: ["/"],
  runtime: "nodejs",
};