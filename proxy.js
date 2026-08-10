// 프로젝트 최상단 (root) 경로의 proxy.js
import { updateSession } from "./lib/supabase/middleware";

// 💡 export하는 함수 이름을 middleware에서 proxy로 변경했습니다.
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};