import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/context/AuthContext";
import {ThemeProvider} from "@/context/ThemeContext";
import ProtectedLayout from "@/components/ProtectedLayout";
import {Notify} from "@/components/Notify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MyFit",
};

const RootLayout = ({children}) => {
  return (
    <html
      suppressHydrationWarning
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Script para carregar tema antes de renderizar (evita flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const temaBooleano = localStorage.getItem("isDarkMode");
                const temaLegado = localStorage.getItem("theme");
                const deveUsarTemaEscuro = temaBooleano === "true" || (!temaBooleano && temaLegado === "dark");

                if (deveUsarTemaEscuro) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <AuthProvider>
        <ThemeProvider>
          <body>
            <ProtectedLayout>{children}</ProtectedLayout>
            <Notify />
          </body>
        </ThemeProvider>
      </AuthProvider>
    </html>
  );
};

export default RootLayout;
