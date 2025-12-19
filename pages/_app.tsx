import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Footer from "@/components/footer"; // Default footer
import AltFooter from "@/components/alt-footer";
import { Analytics } from "@vercel/analytics/react";
import { useRouter } from "next/router";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  return (
    <AuthProvider>
      <div className="bg-gradient-to-br from-purple-500 to-teal-400 min-h-screen flex flex-col">
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        {pathname === "/" ? <AltFooter /> : <Footer />}
        <Analytics />
      </div>
    </AuthProvider>
  );
}
