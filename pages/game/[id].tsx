// pages/game/[id].tsx

import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {supabase} from '../../utility/supabaseClient';
import {Comment, Game} from '../../redux/types';
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Avatar,
    Box, Button,
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
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {useTheme} from "@mui/material/styles";
import CommentForm from "../../components/commentForm";
import {GridExpandMoreIcon} from "@mui/x-data-grid";
import {useUser} from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";
import {Toast} from "next/dist/client/components/react-dev-overlay/internal/components/Toast";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {PostgrestError} from "@supabase/supabase-js";

export default function GamePage() {
    const router = useRouter();
    const user = useUser();
    const { id } = router.query;
    const [game, setGame] = useState<Game | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [userRating, setUserRating] = useState<number>(0);
    const [userRated, setUserRated] = useState<boolean>(false); // Nowy stan
    const [comments, setComments] = useState<Comment[]>([]);
    const [avatarUrls, setAvatarUrls] = useState<(string | null)[]>([]);
    const [relatedGames, setRelatedGames] = useState<Game[] | null>([]);
    const [showAllComments, setShowAllComments] = useState(false);


    const handleCommentAdded = (newComment: Comment) => {
        setComments((prevComments) => [newComment, ...prevComments]);
    };



    useEffect(() => {
        const fetchGame = async () => {
            try {
                if (id && typeof id === 'string') {
                    const { data: gameData, error } = await supabase
                        .from('games')
                        .select('*, platforms(name), age_ranges(age_range)')
                        .eq('id', id)
                        .single();

                    if (error) {
                        console.error('Error fetching game:', error.message);
                    } else {
                        setGame(gameData as Game);


                        // Pobierz informacje o gatunkach dla danej gry
                        const { data: genresData, error: genresError } = await supabase
                            .from('game_genres')
                            .select('game_id, genre_id, genres (genre_name)')
                            .eq('game_id', id);

                        if (genresError) {
                            console.error('Error fetching genres:', genresError.message);
                        } else {

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
                    const {data: ratingData, error: ratingError} = await supabase
                        .from('ratings')
                        .select('rating')
                        .eq('game_id', id)

                    if (ratingError) {
                        setRating(0);
                        setUserRating(0);
                        console.error('Error fetching rating:', ratingError);
                    } else {
                        // @ts-ignore
                        const total = ratingData?.reduce((sum, rating) => sum + rating.rating, 0) || 0;
                        setRating(total);
                    }

                    if (user) {
                        const {data: userRatingData, error: userRatingError} = await supabase
                            .from('ratings')
                            .select('*')
                            .eq('game_id', id)
                            .eq('user_id', user.id)

                        if (userRatingError) {
                            console.error('Error fetching user rating:', userRatingError);
                        } else {
                            if (userRatingData && userRatingData.length > 0) {
                                setUserRating(userRatingData[0].rating || 0);
                            }


                        }
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
                        // @ts-ignore
                        const sortedComments = (commentsData as Comment[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());                        setComments(commentsData as Comment[]);

                        setComments(sortedComments);

                        // Pobieranie avatara dla każdego komentarza
                        const avatarPromises = commentsData?.map(async (comment) => {

                            const {data, error
                                // @ts-ignore
                            } = await supabase.storage.from('avatars').download(comment.profiles.avatar_url);
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

        const fetchRelatedGames = async (originalGameId: any) => {
            try {
                const { data: originalGenresData, error: originalGenresError } = await supabase
                    .from('game_genres')
                    .select('genre_id')
                    .eq('game_id', originalGameId);

                if (originalGenresError) {
                    return [];
                }

                const originalGenreIds = originalGenresData.map((genre) => genre.genre_id);

                const { data: relatedGamesData, error: relatedGamesError } = await supabase
                    .from('game_genres')
                    .select('game_id')
                    .in('genre_id', originalGenreIds)
                    .neq('game_id', originalGameId)
                    .limit(3);

                if (relatedGamesError) {
                    console.error('Error fetching related games:', relatedGamesError.message);
                    return [];
                }

                const relatedGameIds = relatedGamesData.map((game) => game.game_id);

                const { data: relatedGamesFullData, error: relatedGamesFullError } = await supabase
                    .from('games')
                    .select('*')
                    .in('id', relatedGameIds);

                if (relatedGamesFullError) {
                    console.error('Error fetching full data for related games:', relatedGamesFullError.message);
                    return [];
                }

                    setRelatedGames(relatedGamesFullData as Game[]);

            } catch (error: any) {
                console.error('Error fetching and processing related games:', error.message);
                return [];
            }
        };

        const fetchRelatedGamesData = async () => {
                await fetchRelatedGames(id);
        };



        fetchGame();
        fetchRating();
        fetchComments();
        fetchRelatedGamesData();
    }, [id]);


    const handleShowAllComments = () => {
        setShowAllComments(true);
    };

    const handleCommentDelete = async (commentId?: number) => {
        try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);

            if (error) {
                console.error('Error deleting comment:', error.message);
            } else {
                // Po usunięciu komentarza, możesz zaktualizować stan komponentu
                // aby usunąć komentarz z listy
                setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));

                toast.success('Comment deleted successfully');
            }
        } catch (error: any) {
            console.error('Error deleting comment:', error.message);
        }
    };


    const handleRatingChange = async (newRating: number) => {
        try {
            if (id && user && user.id) { // Dodano warunek sprawdzający, czy user.id istnieje
                // Sprawdź, czy użytkownik już ocenił grę
                const { data: existingUserRating, error: existingUserRatingError } = await supabase
                    .from('ratings')
                    .select('rating, id') // Dodano pobieranie id oceny użytkownika
                    .eq('game_id', id)
                    .eq('user_id', user.id);

                if (existingUserRatingError) {
                    console.error('Error fetching existing user rating:', existingUserRatingError);
                } else {
                    // Jeśli użytkownik już ocenił grę, zaktualizuj istniejącą ocenę
                    if (existingUserRating && existingUserRating.length > 0) {
                        const existingRatingId = existingUserRating[0].id;

                        const { data: updatedRating, error: updateRatingError } = await supabase
                            .from('ratings')
                            .update({ rating: newRating })
                            .eq('id', existingRatingId);

                        if (updateRatingError) {
                            console.error('Error updating user rating:', updateRatingError);
                        } else {
                            console.log('User rating updated:');

                            toast.success('Rating updated successfully.');

                            // Zaktualizuj stan oceny użytkownika
                            setUserRating(newRating);
                        }
                    } else {
                        // Jeśli użytkownik jeszcze nie ocenił gry, dodaj nową ocenę
                        const { data: newRatingData, error: newRatingError } = await supabase
                            .from('ratings')
                            .insert([{ game_id: id, user_id: user.id, rating: newRating }]);

                        if (newRatingError) {
                            console.error('Error adding new user rating:', newRatingError);
                        } else {
                            console.log('New user rating added:', newRatingData);

                            // Zaktualizuj stan oceny użytkownika i ustaw flagę, że użytkownik ocenił grę
                            setUserRating(newRating);
                            setUserRated(true);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error handling rating change:', error);
        }
    };


    return (
        <>
            <CustomizedBreadcrumbs/>
            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} md={8} alignItems='center'>
                    <Container  maxWidth="sm" component="main" sx={{pt: 8, pb: 6}}>
                        <Typography
                            component="h1"
                            variant="h6"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            {game?.title}
                            <Divider/>
                        </Typography>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <img src={game?.cover_image_url} alt={game?.title}/>
                        </div>
                    </Container>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Stack spacing={2} sx={{width: '100%'}}>
                        <Paper elevation={2} sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{display: 'flow', alignItems: 'center'}}>
                                <Typography variant="h6" component="div" textAlign='center'>
                                    Overall rating
                                </Typography>
                                <Rating
                                    name="game-rating"
                                    value={rating}
                                    precision={0.5}
                                    readOnly
                                    sx={{ml: 1, color: 'warning.main'}}
                                />
                                <Typography variant="h6" component="div" textAlign='center'>
                                    Your rating
                                </Typography>
                                <Rating
                                    name="user-rating"
                                    value={userRating}
                                    precision={0.5}
                                    readOnly={!user}
                                    onChange={(event, newValue) => handleRatingChange(newValue as number)}
                                    sx={{ml: 1, color: 'warning.main'}}
                                />
                            </Box>
                        </Paper>
                        <Paper elevation={2} sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <Typography variant="h6" component="div">
                                Genres
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="subtitle1" component="div" textAlign="center">
                                    {game?.genres && (
                                        <>
                                            {game.genres.map((genre: any, index: number) => (
                                                <React.Fragment key={index}>
                                                    {index > 0 && <br/>}
                                                    {genre.genres.genre_name}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={2} sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <Typography variant="h6" component="div">
                                Platform
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="subtitle1" component="div" textAlign="center">
                                    {game?.platforms.name || 'No platforms'}
                                </Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={2} sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <Typography variant="h6" component="div">
                                Age recommendation:
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="subtitle1" component="div" textAlign="center">

                                    {game?.age_ranges.age_range || 'No age range'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{pt: 8, pb: 6}}>
                        <Typography
                            component="h1"
                            variant="h6"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            Game Description
                        </Typography>
                        <Typography variant="body2" component="div" textAlign="center" color="text.primary">
                            {game?.description}
                        </Typography>
                    </Container>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{pt: 8, pb: 6}}>
                        <Typography component="h2" variant="h6" align="center" color="text.primary" gutterBottom>
                            Similar games
                        </Typography>

                        {relatedGames && relatedGames.map((game, index) => (
                            <Box key={game.id} sx={{mt: 3}}>
                                <GameCard title={game.title} id={game.id} avatar_url={game.cover_image_url}/>
                            </Box>
                        ))}


                    </Container>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Container disableGutters maxWidth="sm" component="main" sx={{pt: 8, pb: 6}}>
                        <Typography component="h1" variant="h6" align="center" color="text.primary" gutterBottom>
                            Comments
                        </Typography>
                        {/* Wyświetl formularz komentarza */}


                        <CommentForm gameId={id as string} onCommentAdded={handleCommentAdded}/>
                        <Divider orientation="horizontal" sx={{minHeight: 25}} variant="middle"/>
                        <br/>


                        {/* Wyświetl listę komentarzy z akordeonem */}
                        {comments && (
                            <Accordion>
                                <AccordionSummary expandIcon={<GridExpandMoreIcon/>}>
                                    <Typography variant="subtitle1">Show Comments</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={3} sx={{width: '100%'}}>
                                        {comments.slice(0, showAllComments ? comments.length : 5).map((comment, index) => (
                                            <Box key={comment.id} sx={{mt: 3}}>
                                                <Stack direction="row" justifyContent="flex-start" alignItems="center"
                                                       spacing={1}>
                                                    <Avatar src={avatarUrls[index] || undefined}/>
                                                    <Typography variant="subtitle1" color="text.primary">
                                                        {comment.profiles.username || 'Anonymous'}
                                                    </Typography>
                                                    {/* Dodaj przycisk do usuwania komentarza */}
                                                    {user && user.id && comment.user_id === user.id && (
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            startIcon={<DeleteIcon/>}
                                                            onClick={() => handleCommentDelete(comment.id)}>
                                                        Delete
                                                        </Button>
                                                    )}
                                                </Stack>
                                                <Box sx={{mt: 2, ml: 4}}>
                                                    <Typography variant="body1" color="text.primary">
                                                        {comment.content}
                                                    </Typography>

                                                    <Divider orientation="horizontal" sx={{minHeight: 25}}
                                                             variant="middle"/>
                                                </Box>
                                            </Box>
                                        ))}
                                        {comments.length > 5 && !showAllComments && (
                                            <Typography variant="subtitle1" color="text.primary"
                                                        onClick={handleShowAllComments} style={{cursor: 'pointer'}}>
                                                ... and more comments
                                            </Typography>
                                        )}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        )}
                    </Container>
                </Grid>
            </Grid>
        </>
    );
}