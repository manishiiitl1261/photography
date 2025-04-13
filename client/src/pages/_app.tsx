import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReviewProvider } from "@/contexts/ReviewContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ReviewProvider>
        <Component {...pageProps} />
      </ReviewProvider>
    </LanguageProvider>
  );
}