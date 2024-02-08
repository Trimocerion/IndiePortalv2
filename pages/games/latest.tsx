// pages/latest.tsx
import * as React from 'react';
import {useEffect, useState} from 'react';
import {Container, Grid, Pagination, Skeleton, Typography} from '@mui/material';
import {supabase} from '../../utility/supabaseClient';
import {Game} from '../../redux/types';
import GameCard from '../../components/gamecard';

const LatestPage: React.FC = () => {
    const [latestGames, setLatestGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLatestGames = async (pageNumber: number) => {
        try {
            const itemsPerPage = 8;
            const startIdx = (pageNumber - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage - 1;

            const { data: latestGamesData, error } = await supabase
                .from('games')
                .select('*')
                .order('created_at', { ascending: false })
                .range(startIdx, endIdx);

            if (error) {
                return;
            }

            // @ts-ignore
            setLatestGames(latestGamesData || []);

        } catch (error: any) {
            console.error('Error fetching latest games:', error.message);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: totalCount, error: countError } = await supabase
                    .from('games')
                    .select('id', { count: 'exact' });

                if (countError) {
                    console.error('Error fetching total count:', countError.message);
                    return;
                }

                const totalCountValue = totalCount?.length;
                const calculatedTotalPages = Math.ceil(totalCountValue / 8);

                setTotalPages(calculatedTotalPages);

                await fetchLatestGames(page);
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
                    Latest games
                </Typography>
            </Container>

            <Container maxWidth="md" component="main" sx={{ mb: 8 }}>
                <Grid container spacing={5} alignItems="flex-end">
                    {(loading ? Array.from(new Array(8)) : latestGames).map((item, index) => (
                        <Grid item key={index} xs={12} sm={6} md={3}>
                            {loading ? (
                                <Skeleton variant="rectangular" height={200} />
                            ) : (
                                <GameCard title={item.title} desc={item.description} avatar_url={item.cover_image_url} id={item.id} genres={item.genres} created_at={item.created_at} />
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
};

export default LatestPage;
