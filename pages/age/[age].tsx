import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container, Grid, Typography } from "@mui/material";
import { supabase } from "../../utility/supabaseClient";
import GameCard from "../../components/gamecard";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Game } from "../../redux/types";

export default function AgePage() {
  const router = useRouter();
  const { age } = router.query;
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        if (!age) return;

        // Fetch the age range id based on its name
        const { data: ageRangeData, error: ageRangeError } = await supabase
          .from("age_ranges")
          .select("id")
          .eq("age_range", Array.isArray(age) ? age[0] : age)
          .single();

        if (ageRangeError) {
          throw ageRangeError;
        }

        const ageRangeId = ageRangeData?.id;

        if (!ageRangeId) {
          console.error("Age range not found");
          return;
        }

        // Fetch games based on the age range ID
        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("*, favorites(*)")
          .eq("age_range", ageRangeId);

        if (gamesError) {
          throw gamesError;
        }

        setGames(gamesData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGames();
  }, [age]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <Grid item xs={2}>
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
      </Grid>
      <Container
        disableGutters
        maxWidth="sm"
        component="main"
        sx={{ pt: 8, pb: 6 }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {age} games
        </Typography>
      </Container>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Container maxWidth="md" component="main" sx={{ mb: 8 }}>
          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
            {games.map((game, index) => (
              <Grid
                item
                key={index}
                xs={12}
                sm={12}
                md={3}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <GameCard
                  id={game.id}
                  title={game.title || ''}
                  desc={game.description || ''}
                  // @ts-ignore
                  favorites={game.favorites}
                  avatar_url={game.cover_image_url || ''}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}