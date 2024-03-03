import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../../utility/supabaseClient";
import Carousel from "react-material-ui-carousel";
import RelatedGamecard from "../../components/relatedGamecard";

const UserProfile = () => {
    const router = useRouter();
    const { username } = router.query;
    const [userData, setUserData] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<any>(null);
    const [favoriteGames, setFavoriteGames] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .single();

                if (userError) {
                    throw userError;
                }

                setUserData(userData);


                // @ts-ignore
                const {data: avatarUrl, error: avatarError} = await supabase.storage.from('avatars').download(userData.avatar_url);

                if (avatarError) {
                    throw avatarError;
                }

                const avatarURL = URL.createObjectURL(avatarUrl);


                setAvatarUrl(avatarURL);

                console.log('Profile Avatar URL:', avatarUrl);

                const { data: gamesData, error: gamesError } = await supabase
                    .from('favorites')
                    .select('game_id, games(*)')
                    .eq('profile_id', userData.id);

                if (gamesError) {
                    throw gamesError;
                }




                const favoriteGames = gamesData.map((game: any) => game.games);





                console.log('Favorite games:', favoriteGames)

                setFavoriteGames(favoriteGames);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (username) {
            fetchUserData();
        }
    }, [username]);

    const handleGoBack = () => {
        router.back();
    };

    if (!username || !userData) {
        return <div>Loading...</div>;
    }

    return (
        <>


                <Paper elevation={1} sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <Grid item xs={2} >
                        <IconButton onClick={handleGoBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Grid>
                    <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>

                    <Stack justifyContent="center" alignItems="center">
                            <Avatar variant="rounded" sx={{ height: 300, width: 300 }} alt={userData.username} src={avatarUrl} />
                            <Typography variant="h4" component="h1" textAlign='center'>
                                {userData.username}
                            </Typography>
                            <Typography textAlign='center' >
                                {userData.email}
                            </Typography>

                                <Typography textAlign='center'>
                                    Level: {(userData.rank / 5).toFixed(0)}
                                </Typography>
                                    <Divider variant='middle' flexItem />
                            <Typography variant="body1" component="h1" textAlign='center' >
                                About: <br />
                                {userData.description}
                            </Typography>
                        <Divider variant='middle' flexItem />

                        <Typography variant="body1" component="h1" gutterBottom textAlign='center' >
                                Favorite games: <br />
                                {favoriteGames.length > 0 &&
                                    <Card variant="outlined" sx={{ width: 300, p: 0 }}>
                                            <Carousel autoPlay>
                                            {favoriteGames.map((game: any) => (

                                                <React.Fragment key={game.id}>
                                                   <RelatedGamecard desc={game.desc} title={game.title} id={game.id} avatar_url={game.cover_image_url} />
                                                </React.Fragment>
                                            ))}
                                            </Carousel>
                                    </Card>
                                }
                            </Typography>
                        </Stack>
                    </Container>
                </Paper>
        </>
    );
};

export default UserProfile;
