"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  // 브라우저용 Supabase Client
  const supabase = useMemo(() => createClient(), []);

  // 현재 로그인 사용자
  const [user, setUser] = useState(null);

  // 최초 인증 상태 확인 여부
  const [loading, setLoading] = useState(true);

  // 현재 사용자 다시 확인
  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // 여기부터 추가
        // 로그인 세션이 없는 경우는 정상적인 로그아웃 상태
        if (error.name === "AuthSessionMissingError") {
          setUser(null);
          return null;
        }
        // 여기까지 추가

        console.error("[AuthContext] 사용자 조회 실패:", error);
        setUser(null);
        return null;
      }

      setUser(user);

      return user;
    } catch (error) {
      console.error("[AuthContext] 사용자 조회 오류:", error);
      setUser(null);

      return null;
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error) {
          // 여기부터 추가
          // 로그인 세션이 없는 경우는 정상적인 로그아웃 상태
          if (error.name === "AuthSessionMissingError") {
            setUser(null);
            return;
          }
          // 여기까지 추가

          console.error("[AuthContext] 초기 사용자 조회 실패:", error);
          setUser(null);
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("[AuthContext] 초기 사용자 조회 오류:", error);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 로그인 / 로그아웃 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 로그아웃
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      console.error("[AuthContext] 로그아웃 실패:", error);
      return false;
    }

    setUser(null);

    router.push("/");
    router.refresh();

    return true;
  }, [router, supabase]);

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
