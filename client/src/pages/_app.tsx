import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ReviewProvider>
          <Component {...pageProps} />
        </ReviewProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}