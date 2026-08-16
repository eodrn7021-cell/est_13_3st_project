import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// 로그인이 필요한 페이지
const protectedRoutes = ["/my-page", "/my-characters", "/characters/create"];

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 현재 로그인 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 현재 주소가 보호된 페이지인지 확인
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 로그인하지 않은 사용자는 로그인 페이지로 이동
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";

    // 원래 가려고 했던 주소 저장
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

    loginUrl.searchParams.set("reason", "protected");

    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
