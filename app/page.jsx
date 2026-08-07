import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HomeSidebar from "@/components/home/HomeSidebar/HomeSidebar";
import Hero from "@/components/home/Hero/Hero";
import RecommendedCharacters from "@/components/home/RecommendedCharacters/RecommendedCharacters";
import QuickMenu from "@/components/home/QuickMenu/QuickMenu";
import styles from "./page.module.scss";

const HomePage = () => {
  return (
    <>
      <Header />

      <main className={styles.home}>
        {/* 사이드바 + 메인 콘텐츠 */}
        <div className={styles.home_inner}>
          {/* PC 사이드바 */}
          <HomeSidebar />

          {/* 메인 콘텐츠 */}
          <div className={styles.home_content}>
            {/* Hero */}
            <Hero />

            {/* 추천 캐릭터 */}
            <RecommendedCharacters />

            {/* 주요 기능 */}
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
                tabletDescription="새 캐릭터를 만들어보세요"
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
                tabletDescription="다양한 캐릭터를 만나요"
              />

              <QuickMenu
                href="/my-page"
                icon="manage_accounts"
                title="캐릭터 관리하기"
                description={
                  <>
                    내가 만든 캐릭터 설정을
                    <br />
                    편리하게 관리해보세요
                  </>
                }
                tabletDescription="내 캐릭터를 관리해보세요"
              />
            </section>

            {/* 추후 카테고리 */}
            {/* <CategoryList /> */}

            {/* 추후 인기 스토리 */}
            {/* <PopularStories /> */}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
