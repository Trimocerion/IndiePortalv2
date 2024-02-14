import {useSupabaseClient, useUser} from '@supabase/auth-helpers-react'
import * as React from 'react';
import {useEffect} from 'react';
import {Box, CssBaseline, Grid, Paper} from '@mui/material';
import {ThemeSupa} from '@supabase/auth-ui-shared';
import {Auth} from '@supabase/auth-ui-react'
import {useTheme} from '@mui/material/styles';
import Head from 'next/head';
import CustomizedBreadcrumbs from "../components/breadcrumb";
import {useRouter} from "next/router";


export default function SignIn() {
const supabase = useSupabaseClient()
const theme = useTheme()
const router = useRouter();
const user = useUser()

useEffect(() => {
        if (user) {
            router.push('/')
        }
    })


  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
       <Head>
        <title>Signup | IndiePortal</title>
      </Head>
      <CssBaseline />
      <Grid item xs={12} sm={8} md={4} component={Paper} square>

              <CustomizedBreadcrumbs/>

        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
           <Box component="img" sx={{ height:"10rem",width:"10rem" }} src="/logo.png"/>
        </Box>

        <Box sx={{ mx: 6 }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            magicLink
            providers={['google', 'github']}
            theme={theme.palette.mode}
            redirectTo="http://localhost:3000"
          />
        </Box>
      </Grid>
      <Grid
        item
        xs={false}
        sm={4}
        md={8}
        sx={{
          backgroundImage: `url('/loginimg.png')`,
          backgroundRepeat: 'repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

    </Grid>
  );
}