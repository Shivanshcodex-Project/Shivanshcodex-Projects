import "./globals.css";

export const metadata = {
  title: "Hand Boxing Game",
  description: "Mobile camera hand-controlled 3D boxing game (WebGL)."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
