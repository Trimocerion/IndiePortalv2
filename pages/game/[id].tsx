// pages/game/[id].tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utility/supabaseClient';
import { Comment, Game, Genre } from '../../redux/types';
import {
    Avatar,
    Box,
    Container,
    Divider,
    Grid,
    Paper,
    Rating,
    Stack,
    Typography,
} from "@mui/material";

import CustomizedBreadcrumbs from "../../components/breadcrumb";
import GameCard from "../../components/gamecard";
import React from 'react';
import {PostgrestError} from "@supabase/supabase-js";

export default function GamePage() {
    const router = useRouter();
    const { id } = router.query;
    const [game, setGame] = useState<Game | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [avatarUrls, setAvatarUrls] = useState<(string | null)[]>([]);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                if (id && typeof id === 'string') {
                    const { data: gameData, error } = await supabase
                        .from('games')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) {
                        console.error('Error fetching game:', error.message);
                    } else {
                        console.log('Game:', gameData)
                        setGame(gameData as Game);


                        // Pobierz informacje o gatunkach dla danej gry
                        const { data: genresData, error: genresError } = await supabase
                            .from('game_genres')
                            .select('game_id, genre_id, genres (genre_name)')
                            .eq('game_id', id);

                        if (genresError) {
                            console.error('Error fetching genres:', genresError.message);
                        } else {
                            console.log('Genres:', genresData);

                            // Tutaj możesz zaktualizować stan gier z pobranymi informacjami o gatunkach
                            // np. dodając nową kolumnę genres do stanu game
                            setGame(prevGame => {
                                    return {
                                        ...prevGame,
                                        genres: genresData || []
                                    };
                                }
                            );
                        }

                    }
                }
            } catch (error) {
                console.error('Error fetching game:', error);
            }
        };

        const fetchRating = async () => {
            try {
                if (id && typeof id === 'string') {
                    const { data: ratingData, error } = await supabase
                        .from('ratings')
                        .select('rating')
                        .eq('game_id', id)

                    if (error) {
                        setRating(0);
                        console.error('Error fetching rating:', error);
                    } else {
                        console.log('Rating:', ratingData)

                        const total = ratingData?.reduce((sum, rating) => sum + rating.rating, 0) || 0;

                        setRating(total);
                    }
                }
            } catch (error) {
                console.error('Error fetching rating:', error);
            }
        };

        const fetchComments = async () => {
            try {
                if (id && typeof id === 'string') {
                    const { data: commentsData, error } = await supabase
                        .from('comments')
                        .select(
                            'id, content, created_at, user_id, profiles (username, avatar_url)'
                        )
                        .eq('game_id', id);

                    if (error) {
                        console.error('Error fetching comments:', error.message);
                    } else {
                        console.log('Comments:', commentsData);
                        setComments(commentsData || []);

                        // Pobieranie avatara dla każdego komentarza
                        const avatarPromises = commentsData?.map(async (comment) => {
                            const { data, error } = await supabase.storage.from('avatars').download(comment.profiles.avatar_url);
                            if (error) {
                                console.error('Error downloading image:', error.message);
                                return null;
                            }
                            const url = URL.createObjectURL(data);
                            return url;
                        }) || [];

                        const avatarUrls = await Promise.all(avatarPromises);
                        setAvatarUrls(avatarUrls);
                    }
                }
            } catch (error) {
                console.error('Error fetching and processing comments:', error);
            }
        };



        fetchGame();
        fetchRating();
        fetchComments();
    }, [id]);


    return (
        <>
            <CustomizedBreadcrumbs />
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                        <Typography
                            component="h1"
                            variant="h6"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            {game?.title}
                            <Divider />
                        </Typography>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <img src={game?.cover_image_url} alt={game?.title} />
                        </div>
                    </Container>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Stack spacing={2} sx={{ width: '100%' }}>
                        <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" component="div">
                                    Ocena
                                </Typography>
                                <Rating
                                    name="game-rating"
                                    value={rating}
                                    precision={0.5}
                                    readOnly={!rating}
                                    sx={{ ml: 1, color: 'warning.main' }}
                                />
                            </Box>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <Typography variant="h6" component="div">
                                Gatunek
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" component="div" textAlign="center">
                                    {game?.genres && (
                                        <>
                                            {game.genres.map((genre: any, index: number) => (
                                                <React.Fragment key={index}>
                                                    {index > 0 && <br />}
                                                    {genre.genres.genre_name}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <Typography variant="h6" component="div">
                                Platforma
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" component="div" textAlign="center">
                                    {game?.platforms && (
                                        <>
                                            {game.platforms.map((platform, index) => (
                                                <React.Fragment key={index} >
                                                    {index > 0 && <br />}
                                                    {platform}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                        <Typography
                            component="h1"
                            variant="h6"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            Opis
                        </Typography>
                        <Typography variant="body2" component="div" textAlign="center">
                            {game?.description}
                        </Typography>
                    </Container>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                        <Typography component="h2" variant="h6" align="center" color="text.primary" gutterBottom>
                            Podobne gry
                        </Typography>
                        {/* Tutaj możesz dodać logikę do pobrania powiązanych gier z bazy danych */}
                        {/* {game.genres && game.genres.length > 0 && (
              // Pobierz gry o tych samych gatunkach, wyklucz bieżącą grę
              // Zakłada, że `supabase.from('games').select('*').in('genres', game.genres)` zwraca listę powiązanych gier
              <ul>
                Mapuj i wyświetl powiązane gry
                {relatedGames.map((relatedGame) => (
                  <li key={relatedGame.id}>
                    <GameCard
                      title={relatedGame.title}
                      desc={relatedGame.description}
                      avatar_url={relatedGame.cover_image_url}
                      id={relatedGame.id}
                    />
                  </li>
                ))}
              </ul>
            )}*/}
                    </Container>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                        <Typography
                            component="h1"
                            variant="h6"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            Komentarze
                        </Typography>
                        <Typography variant="body2" component="div" textAlign="center">
                            {/* Wyświetl listę komentarzy */}
                            {comments.map((comment, index) => (
                                <Box key={comment.id} sx={{ mt: 3 }}>
                                    <Avatar src={avatarUrls[index]} sx={{ mr: 2 }} />
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {comment.profiles.username}
                                    </Typography>
                                    <Typography variant="body2">
                                        {comment.content}
                                    </Typography>
                                </Box>
                            ))}
                        </Typography>
                    </Container>
                </Grid>
            </Grid>
        </>
    );
}