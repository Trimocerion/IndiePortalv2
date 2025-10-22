import React from 'react';
import { Container, Grid, Link, Typography, Box } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

import CssBaseline from "@mui/material/CssBaseline";

const StickyFooter = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh', // Ensure the container takes at least the full viewport height
            }}
        >
            <CssBaseline />
            <Box
                component="footer"
                sx={{
                    p: 6,
                    mt: 'auto', // Push the footer to the bottom
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[200]
                            : theme.palette.grey[800],
                }}
            >
            <Container maxWidth="lg">
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            IndiePortal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your gateway to the world of indie games. Discover new adventures and support independent developers.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Quick Links
                        </Typography>
                        <Link href="/" color="text.secondary" display="block">Home</Link>
                        <Link href="/game-finder" color="text.secondary" display="block">Game Finder</Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Follow Us
                        </Typography>
                        <Link href="https://www.facebook.com" color="text.secondary">
                            <FacebookIcon />
                        </Link>
                        <Link href="https://www.twitter.com" color="text.secondary" sx={{ pl: 1, pr: 1 }}>
                            <TwitterIcon />
                        </Link>
                        <Link href="https://www.instagram.com" color="text.secondary">
                            <InstagramIcon />
                        </Link>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'Copyright © '}
                        <Link color="inherit" href="">
                            IndiePortal
                        </Link>{' '}
                        {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </Container>
        </Box>
</Box>
    );
};

export default StickyFooter;