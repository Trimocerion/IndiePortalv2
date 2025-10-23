import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../../utility/supabaseClient";
import { Comment, Game } from "../../redux/types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

import CustomizedBreadcrumbs from "../../components/breadcrumb";
import CommentForm from "../../components/commentForm";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import { useUser } from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import RelatedGamecard from "../../components/relatedGamecard";

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
  const [gameImage, setGameImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        if (id && typeof id === "string") {
          const { data: gameData, error } = await supabase
            .from("games")
            .select("*, platforms(name), age_ranges(age_range), favorites(*)")
            .eq("id", Number(id))
            .single();

          if (error) {
            console.error("Error fetching game:", error.message);
          } else {
            console.log(gameData);
            setGame(gameData as Game);

            // Pobierz obraz gry
            const url = await downloadImage(gameData?.cover_image_url);
            setGameImage(url);

            // Pobierz informacje o gatunkach dla danej gry
            const { data: genresData, error: genresError } = await supabase
              .from("game_genres")
              .select("game_id, genre_id, genres (genre_name)")
              .eq("game_id", Number(id));

            if (genresError) {
              console.error("Error fetching genres:", genresError.message);
            } else {
              // @ts-ignore
              setGame((prevGame) => {
                return {
                  ...prevGame,
                  genres: genresData || [],
                };
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching game:", error);
      }
    };

    const downloadImage = async (path: any) => {
      try {
        const { data, error } = await supabase.storage
          .from("games")
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        return url;
      } catch (error) {
        console.log("Error downloading image: ", error);
      }
    };

    const fetchRating = async () => {
      try {
        if (id && typeof id === "string") {
          const { data: ratingData, error: ratingError } = await supabase
            .from("ratings")
            .select("rating")
            .eq("game_id", Number(id));

          if (ratingError) {
            setRating(0);
            setUserRating(0);
            console.error("Error fetching rating:", ratingError);
          } else {
            const totalRatings = ratingData?.length || 0; // Liczba ocen

            const sumOfRatings =
              // @ts-ignore
              ratingData?.reduce((sum, rating) => sum + (rating.rating || 0), 0) || 0; // Suma ocen

            const averageRating =
              totalRatings > 0 ? sumOfRatings / totalRatings : 0; // Średnia ocena

            setRating(averageRating);
          }

          if (user) {
            const { data: userRatingData, error: userRatingError } =
              await supabase
                .from("ratings")
                .select("*")
                .eq("game_id", Number(id))
                .eq("user_id", user.id);

            if (userRatingError) {
              console.error("Error fetching user rating:", userRatingError);
            } else {
              if (userRatingData && userRatingData.length > 0) {
                setUserRating(userRatingData[0].rating || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    const fetchComments = async () => {
      try {
        if (id && typeof id === "string") {
          const { data: commentsData, error } = await supabase
            .from("comments")
            .select(
              "id, content, created_at, user_id, profiles (id, username, avatar_url)",
            )
            .eq("game_id", Number(id));

          if (error) {
            console.error("Error fetching comments:", error.message);
          } else {
            // @ts-ignore
            const sortedComments = (commentsData as Comment[]).sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );
            setComments(commentsData as Comment[]);

            setComments(sortedComments);

            // Pobieranie avatara dla każdego komentarza
            const avatarPromises =
              commentsData?.map(async (comment: Comment) => {
                const {
                  data,
                  error,
                  // @ts-ignore
                } = await supabase.storage
                  .from("avatars")
                  // @ts-ignore
                  .download(comment.profiles.avatar_url);
                if (error) {
                  console.error("Error downloading image:", error.message);
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
        console.error("Error fetching and processing comments:", error);
      }
    };

    const fetchRelatedGames = async (originalGameId: any) => {
      try {
        const { data: originalGenresData, error: originalGenresError } =
          await supabase
            .from("game_genres")
            .select("genre_id")
            .eq("game_id", originalGameId);

        if (originalGenresError) {
          return [];
        }

        const originalGenreIds = originalGenresData.map(
          (genre: { genre_id: number }) => genre.genre_id,
        );

        const { data: relatedGamesData, error: relatedGamesError } =
          await supabase
            .from("game_genres")
            .select("game_id")
            .in("genre_id", originalGenreIds)
            .neq("game_id", originalGameId)
            .limit(3);

        if (relatedGamesError) {
          console.error(
            "Error fetching related games:",
            relatedGamesError.message,
          );
          return [];
        }

        const relatedGameIds = relatedGamesData.map((game) => game.game_id);

        const { data: relatedGamesFullData, error: relatedGamesFullError } =
          await supabase.from("games").select("*").in("id", relatedGameIds);

        if (relatedGamesFullError) {
          console.error(
            "Error fetching full data for related games:",
            relatedGamesFullError.message,
          );
          return [];
        }

        setRelatedGames(relatedGamesFullData as Game[]);
      } catch (error: any) {
        console.error(
          "Error fetching and processing related games:",
          error.message,
        );
        return [];
      }
    };

    fetchGame();
    fetchRating();
    fetchComments();
    fetchRelatedGames(id);
  }, [id, user]);

  const handleShowAllComments = () => {
    setShowAllComments(true);
  };

  const handleCommentDelete = async (commentId?: number) => {
    try {
      if (!commentId) return;
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error.message);
      } else {
        // Po usunięciu komentarza, możesz zaktualizować stan komponentu
        // aby usunąć komentarz z listy
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId),
        );

        toast.success("Comment deleted successfully");
      }
    } catch (error: any) {
      console.error("Error deleting comment:", error.message);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    try {
      if (id && user && user.id) {
        // Dodano warunek sprawdzający, czy user.id istnieje
        // Sprawdź, czy użytkownik już ocenił grę
        const { data: existingUserRating, error: existingUserRatingError } =
          await supabase
            .from("ratings")
            .select("rating, id") // Dodano pobieranie id oceny użytkownika
            .eq("game_id", Number(id))
            .eq("user_id", user.id);

        if (existingUserRatingError) {
          console.error(
            "Error fetching existing user rating:",
            existingUserRatingError,
          );
        } else {
          // Jeśli użytkownik już ocenił grę, zaktualizuj istniejącą ocenę
          if (existingUserRating && existingUserRating.length > 0) {
            const existingRatingId = existingUserRating[0].id;

            const { data: updatedRating, error: updateRatingError } =
              await supabase
                .from("ratings")
                .update({ rating: newRating })
                .eq("id", existingRatingId);

            if (updateRatingError) {
              console.error("Error updating user rating:", updateRatingError);
            } else {
              console.log("User rating updated:");

              toast.success("Rating updated successfully.");

              // Zaktualizuj stan oceny użytkownika
              setUserRating(newRating);

              // Pobierz wszystkie oceny dla gry i oblicz nową średnią
              const { data: ratingData, error: ratingError } = await supabase
                .from("ratings")
                .select("rating")
                .eq("game_id", Number(id));

              if (ratingError) {
                console.error("Error fetching rating:", ratingError);
              } else {
                const totalRatings = ratingData?.length || 0;
                const sumOfRatings =
                  ratingData?.reduce((sum: number, rating: { rating: number | null }) => sum + (rating.rating || 0), 0) || 0;
                const averageRating =
                  totalRatings > 0 ? sumOfRatings / totalRatings : 0;
                setRating(averageRating);
              }
            }
          } else {
            const converted_id = parseInt(id as string);

            // Jeśli użytkownik jeszcze nie ocenił gry, dodaj nową ocenę
            const { data: newRatingData, error: newRatingError } =
              await supabase.from("ratings").insert([
                {
                  game_id: converted_id,
                  user_id: user.id,
                  rating: newRating,
                },
              ]);

            if (newRatingError) {
              console.error("Error adding new user rating:", newRatingError);
            } else {
              console.log("New user rating added:", newRatingData);

              // Zaktualizuj stan oceny użytkownika i ustaw flagę, że użytkownik ocenił grę
              setUserRating(newRating);
              setUserRated(true);

              // Pobierz wszystkie oceny dla gry i oblicz nową średnią
              const { data: ratingData, error: ratingError } = await supabase
                .from("ratings")
                .select("rating")
                .eq("game_id", Number(id));

              if (ratingError) {
                console.error("Error fetching rating:", ratingError);
              } else {
                const totalRatings = ratingData?.length || 0;
                const sumOfRatings =
                  ratingData?.reduce((sum: number, rating: { rating: number | null }) => sum + (rating.rating || 0), 0) || 0;
                const averageRating =
                  totalRatings > 0 ? sumOfRatings / totalRatings : 0;
                setRating(averageRating);
              }
            }
          }
          // Update the user's rank in the profiles table
          await updateProfileRank(user.id);
        }
      }
    } catch (error) {
      console.error("Error handling rating change:", error);
    }
  };

  const handleCommentAdded = async (newComment: Comment) => {
    // Check if 'username' property exists in newComment, otherwise set a default value
    const username = "You";

    // Create a new comment object with the necessary properties
    const formattedComment: Comment = {
      id: newComment.id,
      content: newComment.content,
      created_at: newComment.created_at,
      user_id: newComment.user_id,
      profiles: {
        username: username,
        avatar_url: newComment.profiles?.avatar_url || null, // You might want to handle avatar_url similarly
      },
    };

    // Update the state with the new formatted comment
    toast.success("Comment added successfully");
    setComments((prevComments) => [formattedComment, ...prevComments]);

    // Update the user's rank in the profiles table
    await updateProfileRank(newComment.user_id);
  };

  const updateProfileRank = async (userId: any) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("rank")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        return;
      }

      const currentRank = userProfile?.rank || 0;

      const { data: userComments, error: commentsError } = await supabase
        .from("comments")
        .select("id")
        .eq("user_id", userId);

      if (commentsError) {
        console.error("Error fetching user comments:", commentsError.message);
        return;
      }

      const { data: userRatings, error: ratingsError } = await supabase
        .from("ratings")
        .select("id")
        .eq("user_id", userId);

      if (ratingsError) {
        console.error("Error fetching user ratings:", ratingsError.message);
        return;
      }

      // Update the rank by incrementing it by the total number of actions
      // @ts-ignore
      const updatedRank = currentRank + 1;

      await supabase
        .from("profiles")
        .update({ rank: updatedRank })
        .eq("id", userId);

      if (updatedRank % 5 === 0) {
        toast.success("Congratulations! You have reached a new rank!");
      }
    } catch (error: any) {
      console.error("Error updating profile rank:", error.message);
    }
  };

  return (
    <>
      <CustomizedBreadcrumbs />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8} alignItems="center">
          <Container maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
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
            <div style={{ display: "flex", justifyContent: "center" }}>
              {gameImage && <Image
                src={gameImage}
                alt={game?.title || "Game cover"}
                width={400}
                height={400}
              />}
            </div>
          </Container>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flow", alignItems: "center" }}>
                <Typography variant="h6" component="div" textAlign="center">
                  Overall rating
                </Typography>
                <Rating
                  name="game-rating"
                  value={rating}
                  precision={0.5}
                  readOnly
                  sx={{ ml: 1, color: "warning.main" }}
                />
              </Box>
              {user ? (
                <>
                  <Typography variant="h6" component="div" textAlign="center">
                    Your rating
                  </Typography>
                  <Rating
                    name="user-rating"
                    value={userRating}
                    precision={0.5}
                    readOnly={!user}
                    onChange={(event, newValue) =>
                      handleRatingChange(newValue as number)
                    }
                    sx={{ ml: 1, color: "warning.main" }}
                  />
                </>
              ) : (
                <Typography>Please log in to rate the game</Typography>
              )}
            </Paper>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" component="div">
                Genres
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  component="div"
                  textAlign="center"
                >
                  {game?.genres && (
                    <>
                      {game.genres.map((genre: any, index: number) => (
                        <React.Fragment key={index}>
                          {index > 0 && <br />}
                          <Button
                            variant="text"
                            onClick={() =>
                              router.push(`/genre/${genre.genres.genre_name}`)
                            }
                          >
                            {genre.genres.genre_name}
                          </Button>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </Typography>
              </Box>
            </Paper>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" component="div">
                Platform
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  component="div"
                  textAlign="center"
                >
                  {game?.platforms.name > 0 && <br />}
                  <Button
                    variant="text"
                    onClick={() =>
                      router.push(`/platform/${game?.platforms.name}`)
                    }
                  >
                    {game?.platforms.name || "No platforms"}
                  </Button>
                </Typography>
              </Box>
            </Paper>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" component="div">
                Age recommendation:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  component="div"
                  textAlign="center"
                >
                  <Button
                    variant="text"
                    onClick={() =>
                      router.push(`/age/${game?.age_ranges.age_range}`)
                    }
                  >
                    {game?.age_ranges.age_range || "No age range"}
                  </Button>
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Container
            disableGutters
            maxWidth="sm"
            component="main"
            sx={{ pt: 8, pb: 6 }}
          >
            <Typography
              component="h1"
              variant="h6"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Game Description
            </Typography>
            <Typography
              variant="body2"
              component="div"
              textAlign="center"
              color="text.primary"
            >
              {game?.description}
            </Typography>
          </Container>
        </Grid>
        <Grid item xs={12} md={4}>
          <Container maxWidth="sm" sx={{ pt: 8, pb: 6 }}>
            <Typography
              component="h2"
              variant="h6"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Similar games
            </Typography>

            <Stack alignItems="center">
              {relatedGames &&
                relatedGames.map((game, index) => (
                  <Box
                    key={game.id}
                    sx={{ mt: 3 }}
                    onClick={() => router.push(`/game/${game.id}`)}
                  >
                    <RelatedGamecard
                      title={game.title}
                      id={game.id}
                      avatar_url={game.cover_image_url}
                    />
                  </Box>
                ))}
            </Stack>
          </Container>
        </Grid>
        <Grid item xs={12} md={8}>
          <Container
            disableGutters
            maxWidth="sm"
            component="main"
            sx={{ pt: 8, pb: 6 }}
          >
            <Typography
              component="h1"
              variant="h6"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Comments
            </Typography>
            {/* Wyświetl formularz komentarza */}

            <CommentForm
              gameId={id as string}
              onCommentAdded={handleCommentAdded}
            />
            <Divider
              orientation="horizontal"
              sx={{ minHeight: 25 }}
              variant="middle"
            />
            <br />

            {/* Wyświetl listę komentarzy z akordeonem */}
            {comments && (
              <Accordion>
                <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
                  <Typography variant="subtitle1">Show Comments</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3} sx={{ width: "100%" }}>
                    {comments
                      .slice(0, showAllComments ? comments.length : 5)
                      .map((comment, index) => (
                        <Box key={comment.id} sx={{ mt: 3 }}>
                          <Stack
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            spacing={1}
                          >
                            <Avatar src={avatarUrls[index] || undefined} />
                            <Typography
                              component="button"
                              variant="subtitle1"
                              color="text.primary"
                              onClick={() =>
                                router.push(
                                  `/profile/${comment.profiles.username}`,
                                )
                              }
                            >
                              {comment.profiles.username || undefined}
                            </Typography>
                            {/* Dodaj przycisk do usuwania komentarza */}
                            {user && user.id && comment.user_id === user.id && (
                              <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleCommentDelete(comment.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </Stack>
                          <Box sx={{ mt: 2, ml: 4 }}>
                            <Typography variant="body1" color="text.primary">
                              {comment.content}
                            </Typography>

                            <Divider
                              orientation="horizontal"
                              sx={{ minHeight: 25 }}
                              variant="middle"
                            />
                          </Box>
                        </Box>
                      ))}
                    {comments.length > 5 && !showAllComments && (
                      <Typography
                        variant="subtitle1"
                        color="text.primary"
                        onClick={handleShowAllComments}
                        style={{ cursor: "pointer" }}
                      >
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