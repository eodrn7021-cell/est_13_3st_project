"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/common/Button/Button";
import styles from "./LoginModal.module.scss";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("로그인 오류:", error.message);
        setErrorMsg(error.message || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      } else {
        alert("로그인되었습니다!");
        if (onSuccess) onSuccess(data?.user);
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("로그인 예외:", err);
      setErrorMsg("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("test@visulore.com");
    setPassword("12345678");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
          <span className="material-symbols-rounded icon_24">close</span>
        </button>

        <div className={styles.headerArea}>
          <h2 className="kr_t_title">VisuLore 로그인</h2>
          <p className="kr_body">서비스를 이용하시려면 로그인해주세요.</p>
        </div>

        {errorMsg && <div className={`${styles.errorAlert} kr_caption`}>{errorMsg}</div>}

        <form onSubmit={handleLogin} className={styles.formArea}>
          <div className={styles.inputGroup}>
            <label className="kr_caption">이메일 주소</label>
            <input
              type="email"
              placeholder="example@visulore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="kr_body"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className="kr_caption">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="kr_body"
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button type="submit" variant="primary" size="large" disabled={loading}>
              <span className="kr_body_b">{loading ? "로그인 중..." : "로그인"}</span>
            </Button>

            <button
              type="button"
              className={`${styles.demoButton} kr_caption`}
              onClick={handleDemoLogin}
            >
              테스트 계정 자동 입력
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
