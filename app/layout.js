import "./globals.css";

export const metadata = {
  title: "Smo-King Menù Digitale",
  description: "Il catalogo liquidi ufficiale",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}