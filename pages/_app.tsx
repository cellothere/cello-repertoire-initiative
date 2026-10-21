import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import NavbarMain from "@/components/navbar-main";
import Footer from "@/components/footer";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <NavbarMain />
        <main id="main-content" className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
        <Analytics />
      </div>
    </AuthProvider>
  );
}
