
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  useMediaQuery
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../../utility/supabaseClient";
import Carousel from "react-material-ui-carousel";
import RelatedGamecard from "../../components/relatedGamecard";

/**
 * A page component that displays the profile of a user.
 * The user is determined by the `username` query parameter in the URL.
 * @returns {React.ReactElement} The rendered user profile page.
 */
const UserProfile = () => {
    const router = useRouter();
    const { username } = router.query;
    const [userData, setUserData] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<any>(null);
    const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!username) return;

                setLoading(true);
                setError(null);

                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', Array.isArray(username) ? username[0] : username)
                    .single();

                if (userError) throw userError;
                setUserData(userData);

                if (userData.avatar_url) {
                    const { data: avatarData, error: avatarError } = await supabase.storage.from('avatars').download(userData.avatar_url);
                    if (avatarError) throw avatarError;
                    setAvatarUrl(URL.createObjectURL(avatarData));
                }

                const { data: gamesData, error: gamesError } = await supabase
                    .from('favorites')
                    .select('game_id, games(*)')
                    .eq('profile_id', userData.id);

                if (gamesError) throw gamesError;

                const favoriteGames = gamesData.map((game: any) => game.games);
                setFavoriteGames(favoriteGames);

            } catch (error: any) {
                console.error('Error fetching user data:', error);
                setError(error.message || "An error occurred while fetching user data.");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchUserData();
        }
    }, [username]);

    const handleGoBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container component="main" maxWidth="sm" sx={{ pt: 8, pb: 6 }}>
                <Alert severity="error">
                    <Typography>{error}</Typography>
                    <Button onClick={() => router.reload()} color="inherit" size="small">
                        Try Again
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container component="main" maxWidth="sm" sx={{ pt: 8, pb: 6 }}>
                <Alert severity="info">
                    <Typography>User not found.</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Paper elevation={isMobile ? 0 : 1} sx={{ m: isMobile ? 0 : 2, p: 2 }}>
            <IconButton onClick={handleGoBack}>
                <ArrowBackIcon />
            </IconButton>
            <Container maxWidth="md" component="main" sx={{ pt: 4, pb: 6 }}>
                <Grid container spacing={4} direction={isMobile ? 'column' : 'row'}>
                    <Grid item xs={12} md={4}>
                        <Stack alignItems="center" spacing={2}>
                            <Avatar variant="rounded" sx={{ height: isMobile ? 150 : 200, width: isMobile ? 150 : 200 }} alt={userData.username} src={avatarUrl} />
                            <Typography variant={isMobile ? "h5" : "h4"} component="h1" textAlign='center'>
                                {userData.username}
                            </Typography>
                            <Typography textAlign='center' color="text.secondary">
                                {userData.email}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Profile Details</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography>
                                        Level: {Math.floor(userData.rank / 5)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                        <strong>About:</strong><br />
                                        {userData.description || "No description provided."}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Favorite Games</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    {favoriteGames.length > 0 ? (
                                        <Carousel autoPlay={false} navButtonsAlwaysVisible>
                                            {favoriteGames.map((game: any) => (
                                                <RelatedGamecard key={game.id} title={game.title} avatar_url={game.cover_image_url} />
                                            ))}
                                        </Carousel>
                                    ) : (
                                        <Typography>No favorite games to display.</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    );
};

export default UserProfile;
