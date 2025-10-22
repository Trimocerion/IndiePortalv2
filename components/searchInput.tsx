import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { supabase } from '../utility/supabaseClient';
import { useRouter } from "next/router";
import { Avatar, CircularProgress, Divider, ListItemAvatar, Paper, useTheme } from "@mui/material"; // Zaimportuj klienta supabase

interface game {
    id: string;
    title: string;
    cover_image_url: string;
}

const SearchInput = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false); // Dodaj stan wskazujący, czy trwa ładowanie wyników

    const router = useRouter();
    const theme = useTheme(); // Użyj hooka useTheme do dostępu do motywu

    const handleSearch = async (query: any) => {
        setSearchQuery(query); // Aktualizacja stanu zapytania wyszukiwania

        // Jeśli zapytanie jest puste, wyczyść wyniki wyszukiwania
        if (query === '') {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true); // Ustaw stan ładowania na true podczas wyszukiwania

            // Wyszukaj gry zgodne z zapytaniem wyszukiwania
            const { data, error } = await supabase
                .from('games')
                .select('id, title, cover_image_url')
                .ilike('title', `%${query}%`); // Użyj operatora ILIKE do wyszukiwania tytułów gier

            if (error) {
                throw error;
            }

            // Zaktualizuj stan wyników wyszukiwania
            // @ts-ignore
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching games:', error);
        } finally {
            setTimeout(() => setLoading(false), 500); // Ustaw stan ładowania z powrotem na false po zakończeniu wyszukiwania
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setSearchResults([]);
        }, 200);
    };

    const handleGameClick = (id: string) => {
        console.log('Game clicked:', id)
        router.push(`/game/${id}`); // Przejdź do strony gry po kliknięciu wyniku wyszukiwania
    }

    return (
        <div style={{ position: 'relative'}}>
            <TextField
                id="search-input"
                label="Search games"
                value={searchQuery}
                onBlur={handleBlur}
                onChange={(e) => handleSearch(e.target.value)}
                fullWidth
                InputProps={{
                    style: { color: theme.palette.text.primary }, // Ustaw kolor tekstu na kolor tekstu z motywu
                }}
            />

            {loading && ( // Wyświetl wskaźnik ładowania, jeśli trwa ładowanie wyników
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: theme.palette.background.default, zIndex: 999, height: 50 }}>
                    <CircularProgress color="inherit" size={20} />
                </div>
            )}

            {!loading && searchResults.length > 0 && (
                <Paper elevation={3} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999 }}>
                    <List>
                        {searchResults.map((game: game, index: number) => (
                            <React.Fragment key={game.id}>
                                <ListItem onClick={() => handleGameClick(game.id)} style={{ cursor: 'pointer' }}>
                                    <ListItemAvatar>
                                        <Avatar src={game.cover_image_url} />
                                    </ListItemAvatar>
                                    <ListItemText primary={game.title} style={{ color: theme.palette.text.primary }} />
                                </ListItem>
                                {index < searchResults.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </div>
    );
};

export default SearchInput;
