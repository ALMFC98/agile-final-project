import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "9392bf86-a08c-43da-b4e3-f97e114ec3e0");
  requestHeaders.set("x-createxyz-project-group-id", "a67cd95a-87bb-42bf-8e6b-a694429cf771");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}