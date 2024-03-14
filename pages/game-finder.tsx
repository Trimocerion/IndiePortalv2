// pages/game-finder.tsx
import * as React from "react";
import { useState } from "react";
import {
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
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

  const ageRanges = ["3-7", "8-12", "13-17", "18+"];

  const handleSearch = async () => {
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
    }
  };

  return (
    <Container maxWidth="md" component="main" sx={{ mt: 6 }}>
      <Typography variant="h5" align="center" color="text.primary" gutterBottom>
        Game Finder
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={6}>
          <br />

          <FormControl sx={{ width: "50%" }}>
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

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {foundGames.length === 0 &&
      similarGames.length === 0 &&
      isSearchClicked ? (
        <>
          <Divider sx={{ mt: 4 }} />
          <Typography variant="body1" align="center" color="text.secondary">
            No exact match games found.
          </Typography>
        </>
      ) : null}

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
