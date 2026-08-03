"use client";

import Button from "@/components/common/Button/Button";

const HomePage = () => {
  const HandleClick = () => {
    alert("버튼이 정상 작동합니다.");
  };

  return (
    <main>
      <Button variant="secondary" size="medium">
        로그인
      </Button>

      <Button variant="primary" size="large">
        회원가입
      </Button>

      <Button variant="gradient" size="large" onClick={HandleClick}>
        캐릭터 만들기
      </Button>
    </main>
  );
};

export default HomePage;
