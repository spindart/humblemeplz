import type { AppProps } from 'next/app';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  return (
    <>
      {measurementId && <GoogleAnalytics measurementId={measurementId} />}
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
}

export default MyApp;