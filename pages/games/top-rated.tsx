import * as React from 'react';
import {useEffect, useState} from 'react';
import {Container, Grid, Pagination, Skeleton, Typography,} from '@mui/material';
import {supabase} from "../../utility/supabaseClient";
import GameCard from "../../components/gamecard";


export default function TopRated() {
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchGames = async (pageNumber: number) => {
        try {
            const itemsPerPage = 8;
            const startIdx = (pageNumber - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage - 1;

            const { data: gamesData, error } = await supabase
                .from('games')
                .select('*, favorites(*), game_genres(*), ratings(*)')
                .range(startIdx, endIdx)


            if (error) {
                return;
            }

            console.log('Games data:', gamesData)


            // Sumowanie ocen dla każdej gry
            const gamesWithTotalRatings = gamesData.map((game: any) => {
                const totalRating = game.ratings.reduce((acc: number, rating: any) => acc + rating.rating, 0);
                return { ...game, totalRating };
            });


            // Sortowanie gier po sumie ocen (ratingu)
            const sortedGames = gamesWithTotalRatings.sort((a: any, b: any) => b.totalRating - a.totalRating);

            setGames(sortedGames);
        } catch (error: any) {
            console.error('Error fetching games:', error.message);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        scrollTo({ top: 0, behavior: 'smooth' })
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: totalCount, error: countError } = await supabase
                    .from('games')
                    .select('id', { count: 'estimated' ,head:false})

                ;

                if (countError) {
                    console.error('Error fetching total count:', countError.message);
                    return;
                }

                const totalCountValue =  totalCount?.length;
                /* console.log('Total countValue:', totalCountValue);
                 console.log('Total count:', totalCount);*/
                const calculatedTotalPages = Math.ceil(totalCountValue / 8);

                setTotalPages(calculatedTotalPages);

                await fetchGames(page);
                setLoading(false);
            } catch (error: any) {
                console.error('Error fetching data:', error.message);
            }
        };




        fetchData();
    }, [page]);

    return (
        <>
            <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                <Typography component="h1" variant="h4" align="center" color="text.primary" gutterBottom>
                    Top-rated Games
                </Typography>
            </Container>

            <Container maxWidth="md" component="main" sx={{ mb: 8 }}>
                <Grid container spacing={5} alignItems="flex-end">
                    {(loading ? Array.from(new Array(8)) : games).map((item, index) => (
                        <Grid item key={index} xs={12} sm={6} md={3}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={200} />
                            ) : (
                                <GameCard ratings={item.ratings} favorites={item.favorites} title={item.title} desc={item.description} avatar_url={item.cover_image_url} id={item.id} genres={item.genres} created_at={item.created_at} />
                            )}
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Container maxWidth="md" component="main" sx={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination count={totalPages} page={page} variant="outlined" onChange={handlePageChange} />
            </Container>
        </>
    );
}
