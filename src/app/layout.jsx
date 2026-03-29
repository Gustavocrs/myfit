import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/context/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";

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
      <AuthProvider>
        <body>
          <ProtectedLayout>{children}</ProtectedLayout>
        </body>
      </AuthProvider>
    </html>
  );
};

export default RootLayout;
