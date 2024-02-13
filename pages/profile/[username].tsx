import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    Card,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemButton,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react';
import {supabase} from "../../utility/supabaseClient";
import Carousel from "react-material-ui-carousel";
import RelatedGamecard from "../../components/relatedGamecard";
import toast from "react-hot-toast";

const UserProfile = () => {
    const router = useRouter();
    const { username } = router.query;
    const [userData, setUserData] = useState<any>(null);
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
        <Grid>
            <Grid item xs={12} md={12} >
                <Paper elevation={1} sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <Grid spacing={3} justifyContent="center" alignItems='center'>
                        <Grid item xs={2} >
                            <IconButton onClick={handleGoBack}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>
                            <Avatar variant="rounded" sx={{ height: 100, width: '100%' }} alt={userData.username} src={userData.avatarUrl} />
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
                                Opis: <br />
                                {userData.description}
                            </Typography>
                            <Typography variant="body1" component="h1" gutterBottom textAlign='center' >
                                Ulubione gry: <br />
                                {favoriteGames.length > 0 &&
                                    <Card variant="outlined" sx={{ width: 300, p: 0 }}>
                                            <Carousel autoPlay>
                                            {favoriteGames.map((game: any) => (

                                                <React.Fragment key={game.id}>
                                                   <RelatedGamecard desc={game.desc} title={game.title} id={game.id} avatar_url={game.avatar_url} />
                                                </React.Fragment>
                                            ))}
                                            </Carousel>
                                    </Card>
                                }
                            </Typography>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default UserProfile;
