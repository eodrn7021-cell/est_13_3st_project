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

const MaterialSymbolsRounded = localFont({
  src: "../public/fonts/MaterialSymbolsRounded.woff2",
  variable: "--font_material_symbols_rounded",
  display: "swap",
  preload: false,
});

const MaterialSymbolsOutlined = localFont({
  src: "../public/fonts/MaterialSymbolsOutlined.woff2",
  variable: "--font_material_symbols_outlined",
  display: "swap",
  preload: false,
});

const MaterialIconsOutlined = localFont({
  src: "../public/fonts/MaterialIconsOutlined-Regular.otf",
  variable: "--font_material_icons_outlined",
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
      <head></head>
      <body
        className={`${Pretendard.variable} ${LoraFont.variable} ${MaterialSymbolsRounded.variable} ${MaterialSymbolsOutlined.variable} ${MaterialIconsOutlined.variable}`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
