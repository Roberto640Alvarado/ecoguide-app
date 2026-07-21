import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ecoguide_token";
const AUTH_ROUTES = ["/login", "/register"];

type Role = "STUDENT" | "TEACHER";

interface DecodedToken {
  role?: Role;
  exp?: number;
}

/**
 * Decodifica el payload del JWT sin verificar la firma. Sirve únicamente
 * para decisiones de UX en el edge (a qué ruta redirigir); la autorización
 * real siempre la valida ecoguide-api con la firma completa vía el header
 * Authorization en cada request.
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const decoded = JSON.parse(json) as DecodedToken;

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

function getDashboardPath(role: Role): string {
  return role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const decoded = token ? decodeToken(token) : null;
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isStudentRoute = pathname.startsWith("/student");
  const isTeacherRoute = pathname.startsWith("/teacher");

  // Ya con sesión activa: no tiene sentido ver login/registro de nuevo.
  if (isAuthRoute && decoded?.role) {
    return NextResponse.redirect(
      new URL(getDashboardPath(decoded.role), request.url),
    );
  }

  if (isStudentRoute || isTeacherRoute) {
    // Sin sesión (o token expirado/corrupto): a login.
    if (!decoded?.role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Sesión válida pero rol equivocado para esta sección: a su propio panel.
    if (isStudentRoute && decoded.role !== "STUDENT") {
      return NextResponse.redirect(new URL(getDashboardPath(decoded.role), request.url));
    }
    if (isTeacherRoute && decoded.role !== "TEACHER") {
      return NextResponse.redirect(new URL(getDashboardPath(decoded.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/student/:path*", "/teacher/:path*"],
};
