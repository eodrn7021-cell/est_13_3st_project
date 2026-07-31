import "./globals.scss";

export const metadata = {
  title: "VisuLore",
  description: "캐릭터와 세계관 아카이빙 서비스",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
