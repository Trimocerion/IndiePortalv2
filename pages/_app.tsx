import "../styles/globals.css";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

import { supabase } from "../utility/supabaseClient";
import { store } from "../redux/store";
import Layout from "../components/layout";
import StickyFooter from "../components/footer";
import { useRouter } from "next/router";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';
import { setTheme } from "../redux/themeSlice";
import { useEffect, useState } from "react";
import PageLoader from "../components/pageLoader";
import { AnimatePresence, motion } from "framer-motion";

interface MyAppProps extends AppProps {
  initialSession: Session;
}

/**
 * The main application component.
 * It wraps the entire application with necessary providers and layout.
 * @param {MyAppProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered application.
 */
const MyApp: React.FunctionComponent<MyAppProps> = (props) => {
  const { Component, pageProps, initialSession, } = props;
  const router = useRouter();
  const pathname = router.pathname;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedTheme = window.localStorage.getItem("darkMode");
    if (cachedTheme) {
      store.dispatch(setTheme(JSON.parse(cachedTheme)));
    }
  }, []);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };
    const handleComplete = () => {
      setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <Provider store={store}>
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={initialSession}
      >
          <LocalizationProvider dateAdapter={AdapterDayjs} >
        <Layout>
            <AnimatePresence mode="wait">
              {loading ? (
                <PageLoader />
              ) : (
                <motion.div
                  key={router.asPath}
                  initial={{ opacity: 0, x: -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 200 }}
                  transition={{ duration: 0.5 }}
                >
                  <Component {...pageProps} />
                </motion.div>
              )}
            </AnimatePresence>
            {pathname != '/signin' && <StickyFooter/> }
        </Layout>
        <SpeedInsights/>
        <Analytics/>
        <Toaster/>
          </LocalizationProvider>
      </SessionContextProvider>
    </Provider>
  )
}
export default MyApp
