import Header from "@/components/layout/Header/Header";
import QuickMenu from "@/components/home/QuickMenu/QuickMenu";

import styles from "./page.module.scss";

const HomePage = () => {
  return (
    <>
      <Header variant="main" />

      <main>
        <section className={styles.quick_menu_list}>
          <QuickMenu
            href="/characters/create"
            icon="person_add"
            title="캐릭터 만들기"
            description={
              <>
                나만의 캐릭터를 생성하고
                <br />
                스토리를 시작해보세요
              </>
            }
          />

          <QuickMenu
            href="/characters"
            icon="menu_book"
            title="캐릭터 둘러보기"
            description={
              <>
                다양한 캐릭터와 이야기를
                <br />
                자유롭게 둘러보세요
              </>
            }
          />

          <QuickMenu
            href="/mypage"
            icon="manage_accounts"
            title="캐릭터 관리하기"
            description={
              <>
                내가 만든 캐릭터 설정을
                <br />
                편리하게 관리해보세요
              </>
            }
          />
        </section>
      </main>
    </>
  );
};

export default HomePage;
