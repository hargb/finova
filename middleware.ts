import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  console.log("MIDDLEWARE DIAGNOSTIC:", {
    hasNextUrl: !!request.nextUrl,
    url: request.url,
    pathname: request.nextUrl?.pathname,
  });

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
  runtime: "nodejs",
};