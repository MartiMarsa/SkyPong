import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Bungee, Sansation } from "next/font/google";
config.autoAddCss = false;
import { LanguageProvider } from "./context/language-context";
import { AuthProvider } from "./context/auth-context";
import { getCurrentLocale } from "./lib/i18n/locale-manager";
import GlobalChatUI from "./ui/global-chat-ui";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const sansation = Sansation({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-sansation",
});

export const metadata = {
  title: "Transcendence",
  description: "Una Experiencia Trascendental de Pong",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <html lang={getCurrentLocale()}>
          <body>
            {children}
            <GlobalChatUI />
          </body>
        </html>
      </LanguageProvider>
    </AuthProvider>
  );
}
