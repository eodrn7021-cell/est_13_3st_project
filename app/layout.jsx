import localFont from "next/font/local";
import { Lora } from "next/font/google";
import "@/styles/base/_reset.scss";
import "./globals.scss";

const Pretendard = localFont({
  src: [
    {
      path: "../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font_pretendard",
  preload: false,
});

const LoraFont = Lora({
  subsets: ["latin"],
  variable: "--font_lora",
  display: "swap",
  preload: false,
});

export const metadata = {
  title: "VisuLore",
  description: "캐릭터와 세계관 아카이빙 서비스",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          precedence="default"
        />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined&display=swap"
          precedence="default"
        />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          precedence="default"
        />
      </head>
      <body className={`${Pretendard.variable} ${LoraFont.variable}`}>{children}</body>
    </html>
  );
};

export default RootLayout;
