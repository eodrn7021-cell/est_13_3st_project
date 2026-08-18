"use client";

import { useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation/MobileNavigation";

import styles from "./settings.module.scss";

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.pageWrapper}>
      {/* =================================
          Header
      ================================= */}

      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* =================================
          Sidebar + Main
      ================================= */}

      <div className={styles.contentLayout}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} page="mypage" />

        <main className={styles.page}>
          <div className={styles.container}>
            <section className={styles.messageSection}>
              <h1>To be Continued!</h1>

              <p>계정 설정 기능은 준비 중입니다.</p>
            </section>
          </div>
        </main>
      </div>

      {/* =================================
          Mobile Navigation
      ================================= */}

      <div className={styles.pageFooter}>
        <Footer />
      </div>

      <MobileNavigation />
    </div>
  );
};

export default SettingsPage;
