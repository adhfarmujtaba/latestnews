// pages/_app.js
import '../app/globals.css'; // Import global CSS
import Head from 'next/head'; // For setting metadata
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [direction, setDirection] = useState('forward');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!isFirstLoad) {
        setDirection(url > router.asPath ? 'forward' : 'backward');
      }
    };

    const handleRouteChangeComplete = () => {
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router, isFirstLoad]);

  return (
    <>
      <Head>
        <title>My News Website</title>
        <meta name="description" content="Stay updated with the latest news and articles" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <AnimatePresence
          initial={false} // Prevents the initial mount animation
        >
          <motion.div
            key={router.asPath}
            initial={{ x: direction === 'forward' ? '100%' : '-100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 'forward' ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default MyApp;
