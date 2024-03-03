// genre.tsx
import * as React from 'react';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {Container, Grid, Typography} from '@mui/material';
import {supabase} from '../../utility/supabaseClient';
import GameCard from "../../components/gamecard";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Załóżmy, że masz plik supabaseClient z konfiguracją Supabase

export default function GenrePage() {
    const router = useRouter();
    const { genre } = router.query;
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                if (!genre) return;

                // Pobierz ID gatunku na podstawie jego nazwy
                const { data: genreData, error: genreError } = await supabase
                    .from('genres')
                    .select('id')
                    .eq('genre_name', genre)
                    .single();

                if (genreError) {
                    throw genreError;
                }

                const genreId = genreData?.id;
                console.log('Genre ID:', genreId)

                if (!genreId) {
                    console.error('Genre not found');
                    return;
                }

                // Pobierz gry na podstawie ID gatunku
                const { data: gamesData, error: gamesError } = await supabase
                    .from('games')
                    .select('*, game_genres(*), genres(*), favorites(*), platforms(*), age_ranges(*)')
                    .eq('game_genres.genre_id', genreId);

                if (gamesError) {
                    throw gamesError;
                }


                // Filtruj gry, usuwając te, które mają puste pole genres
                const filteredGamesData = gamesData.filter((game: any) => game.genres.length > 0);


                setGames(filteredGamesData || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchGames();
    }, [genre]);

    const handleGoBack = () => {
        router.back();
    };

    return (
        <>
            <Grid item xs={2} >
                <IconButton onClick={handleGoBack}>
                    <ArrowBackIcon />
                </IconButton>
            </Grid>
            <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                <Typography component="h1" variant="h4" align="center" color="text.primary" gutterBottom>
                    {genre} games
                </Typography>
            </Container>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Container maxWidth="md" component="main" sx={{ mb: 8 }}>
                    <Grid container spacing={3} alignItems="center" justifyContent="center">
                        {games.map((game, index) => (
                            <Grid item key={index} xs={12} sm={12} md={3}>
                                <GameCard id={game.id} title={game.title} desc={game.description} favorites={game.favorites} avatar_url={game.cover_image_url} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            )}
        </>
    );
}