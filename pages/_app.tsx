import '../styles/globals.css';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { AppProps } from 'next/app';
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

import { supabase } from "../utility/supabaseClient";
import { store } from "../redux/store";
import Layout from '../components/layout';
import StickyFooter from "../components/footer";
import {useRouter} from "next/router";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";


interface MyAppProps extends AppProps {
  initialSession: Session;
}

const MyApp: React.FunctionComponent<MyAppProps> = (props) => {
  const { Component, pageProps, initialSession, } = props;
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <Provider store={store}>
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={initialSession}
      >
          <LocalizationProvider dateAdapter={AdapterDayjs} >
        <Layout>
          <Component {...pageProps} />
            {pathname != '/signin' && <StickyFooter/> }
        </Layout>
        <Toaster/>
          </LocalizationProvider>
      </SessionContextProvider>
    </Provider>
  )
}
export default MyApp
