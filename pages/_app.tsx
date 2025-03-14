import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Footer from "@/components/footer"; // Adjust the import path as needed
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gradient-to-br from-purple-500 to-teal-400 min-h-screen flex flex-col">
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}
