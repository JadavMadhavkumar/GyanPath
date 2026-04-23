import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Allow login page for everyone
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // For all other routes, let the page handle auth
  return NextResponse.next();
};
