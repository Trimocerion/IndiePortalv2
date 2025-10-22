// pages/game-finder.tsx
import * as React from "react";
import { useState } from "react";
import {
  Button,
  Box,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { supabase } from "../utility/supabaseClient";
import GameCard from "../components/gamecard";
import AutocompleteGenres from "../components/autocompleteGenres";
import { Game } from "../redux/types";

const GameFinder: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState("");
  const [foundGames, setFoundGames] = useState([]);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const ageRanges = ["3-7", "8-12", "13-17", "18+"];

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log("Selected category:", selectedCategory);

      //get ids of games that have the selected category
      const { data: gameGenresData, error: gamesGenresError } = await supabase
        .from("genres")
        .select("*")
        .in("genre_name", selectedCategory);

      if (gamesGenresError) {
        console.error("Error fetching game genres:", gamesGenresError.message);
        return;
      }

      console.log("Game genres data:", gameGenresData);

      //get ids of games with selected genres
      const selectedCategoryIds = gameGenresData.map((genre: any) => genre.id);

      console.log("Selected category ids:", selectedCategoryIds);

      const { data: gamesAgeData, error: gamesAgeError } = await supabase
        .from("age_ranges")
        .select("*")
        .eq("age_range", selectedAgeRange);

      if (gamesAgeError) {
        console.error("Error fetching game age ranges:", gamesAgeError.message);
      }
      console.log("Game age data:", gamesAgeData);

      // Znajdź gry, które są dokładnie zgodne z wybranymi kategoriami i przedziałem wiekowym
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select(
          "*, game_genres(*), genres(*), favorites(*), platforms(*), age_ranges(*)",
        );

      if (gamesError) {
        console.error("Error fetching exact match games:", gamesError.message);
        return;
      }

      console.log("Wszystkie gry:", gamesData);

      // Filtrowanie gier
      const filteredGamesData = gamesData.filter(
        (game: any) =>
          game.game_genres.length > 0 &&
          game.game_genres.every((genre: any) =>
            selectedCategoryIds.includes(genre.genre_id),
          ) &&
          game.age_ranges.age_range === selectedAgeRange,
      );

      console.log("Filtered games:", filteredGamesData);

      if (filteredGamesData.length === 0) {
        console.log("No exact match games found.");
        // @ts-ignore
        setSimilarGames(filteredGamesData);
        setFoundGames([]);
        return;
      }

      setIsSearchClicked(true);

      // @ts-ignore
      setFoundGames(filteredGamesData || []);
    } catch (error: any) {
      console.error("Error searching for games:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" component="main" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" color="text.primary" gutterBottom>
        Find Your Next Favorite Game
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Use the filters below to discover games tailored to your preferences.
      </Typography>

      <Box
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "grey.800" : "grey.100",
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
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
          <AutocompleteGenres
            onSelectedGenresChange={(selectedGenres) =>
              setSelectedCategory(selectedGenres)
            }
          />
          <Button variant="contained" onClick={handleSearch} size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Stack>
      </Box>
      {foundGames.length === 0 &&
      similarGames.length === 0 &&
      isSearchClicked &&
      !loading ? (
        <Box sx={{ mt: 4, p: 3, textAlign: 'center', backgroundColor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" color="text.primary">
            No Games Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We couldn't find any games matching your criteria. Try adjusting your filters.
          </Typography>
        </Box>
      ) : null}

      {foundGames.length > 0 && (
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Search Results
        </Typography>
      )}

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {foundGames.map((game: Game) => (
          <Grid item key={game.id} xs={12} md={4}>
            <GameCard
              title={game.title}
              desc={game.description}
              avatar_url={game.cover_image_url}
              id={game.id}
            />
          </Grid>
        ))}

        {similarGames.map((game: Game) => (
          <Grid item key={game.id} xs={12} md={4}>
            <GameCard
              title={game.title}
              desc={game.description}
              avatar_url={game.cover_image_url}
              id={game.id}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GameFinder;
