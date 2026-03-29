"use client";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import {AuthProvider, useAuth} from "@/context/AuthContext";
import {usePathname, useRouter} from "next/navigation";
import {useEffect} from "react";
import Loading from "@/components/Loading";

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

const ProtectedLayout = ({children}) => {
  const {user, loading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading && pathname !== "/login") {
    return <Loading message="Carregando sessão..." />;
  }

  if (!user && pathname !== "/login") {
    return null; // Evita renderizar o conteúdo protegido antes do redirecionamento
  }

  // Permite o acesso à página de login sem proteção
  if (pathname === "/login") {
    return children;
  }

  return (
    <div className="min-h-full flex flex-col pb-[72px]">
      {children}
      <BottomNav />
    </div>
  );
};

const RootLayout = ({children}) => {
  return (
    <html
      suppressHydrationWarning
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <AuthProvider>
        <body>
          <ProtectedLayout>{children}</ProtectedLayout>
        </body>
      </AuthProvider>
    </html>
  );
};

export default RootLayout;
