import "@/styles/globals.css";
import { useRef } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";
import NavbarMain from "@/components/navbar-main";
import Footer from "@/components/footer";
import MobileTabBar from "@/components/mobile-tab-bar";
import RouteTransitions from "@/components/route-transitions";
import CatalogueAssistant from "@/components/catalogue-assistant";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  const mainRef = useRef<HTMLElement>(null);
  return (
    <AuthProvider>
      <Head>
        {/* Replaces Next's default viewport tag; viewport-fit=cover lets the tab bar sit above the home indicator. */}
        <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <RouteTransitions contentRef={mainRef} />
      <div className="flex min-h-screen flex-col">
        <NavbarMain />
        <main ref={mainRef} id="main-content" className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
        <MobileTabBar />
        <CatalogueAssistant />
        <Analytics />
      </div>
    </AuthProvider>
  );
}
