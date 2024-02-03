
const GameFinder = () =>
{}


/*
// pages/gamefinder.tsx
import * as React from 'react';
import {useState} from 'react';
import {Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, Typography} from '@mui/material';
import {supabase} from '../utility/supabaseClient';
import GameCard from '../components/gamecard';

const GameFinder: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAgeRange, setSelectedAgeRange] = useState('');
    const [foundGames, setFoundGames] = useState([]);

    const categories = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports'];
    const ageRanges = ['3-7', '8-12', '13-17', '18+'];

    const handleSearch = async () => {
        try {
            // Znajdź gry, które są dokładnie zgodne z wybranymi kategoriami i przedziałem wiekowym
            const { data: exactMatchData, error: exactMatchError } = await supabase
                .from('games')
                .select('*')
                .eq('category', selectedCategory)
                .eq('age_range', selectedAgeRange);

            if (exactMatchError) {
                console.error('Error fetching exact match games:', exactMatchError.message);
                return;
            }

            // Znajdź gry podobne (o tych samych kategoriach i przedziale wiekowym)
            const { data: similarGamesData, error: similarGamesError } = await supabase
                .from('games')
                .select('*')
                .in('category', [selectedCategory])
                .eq('age_range', selectedAgeRange)
                .neq('id', exactMatchData?.map((game) => game.id));

            if (similarGamesError) {
                console.error('Error fetching similar games:', similarGamesError.message);
                return;
            }

            // Łącz gry dokładnie zgodne i podobne, eliminując duplikaty
            const combinedGames = [...(exactMatchData || []), ...(similarGamesData || [])];
            const uniqueGames = Array.from(new Set(combinedGames.map((game) => game.id)))
                .map((id) => combinedGames.find((game) => game.id === id));

            setFoundGames(uniqueGames || []);
        } catch (error: any) {
            console.error('Error searching for games:', error.message);
        }
    };

    return (
        <Container maxWidth="md" component="main" sx={{ mt: 6 }}>
            <Typography variant="h5" align="center" color="text.primary" gutterBottom>
                Game Finder
            </Typography>

            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            id="category"
                            value={selectedCategory}
                            label="Category"
                            onChange={(e) => setSelectedCategory(e.target.value as string)}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="age-range-label">Age Range</InputLabel>
                        <Select
                            labelId="age-range-label"
                            id="age-range"
                            value={selectedAgeRange}
                            label="Age Range"
                            onChange={(e) => setSelectedAgeRange(e.target.value as string)}
                        >
                            {ageRanges.map((ageRange) => (
                                <MenuItem key={ageRange} value={ageRange}>
                                    {ageRange}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Button variant="contained" onClick={handleSearch}>
                        Search
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 4 }}>
                {foundGames.map((game) => (
                    <Grid item key={game.id} xs={12} md={4}>
                        <GameCard
                            title={game.title}
                            desc={game.description}
                            avatar_url={game.cover_image_url}
                            id={game.id}
                            genres={game.genres}
                            created_at={game.created_at}
                        />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};
*/


export default GameFinder;

