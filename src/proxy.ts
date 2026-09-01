import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const utente = req.auth?.user;

  if (pathname.startsWith("/admin") && utente?.ruolo !== "admin") {
    const url = utente ? new URL("/", req.url) : new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/profilo") && !utente) {
    const url = new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/profilo/:path*"],
};
