// components/GameCard.tsx
import React, { useEffect, useState } from "react";
import {
  Badge,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Collapse,
  IconButtonProps,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import FavoriteIcon from "@mui/icons-material/Favorite";
import toast from "react-hot-toast";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../utility/supabaseClient";

interface GameCardProps {
  title?: string;
  avatar_url?: string;
  desc?: string;
  id: number;
  genres?: any[];
  created_at?: any;
  favorites?: any[];
  ratings?: any[];
}

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const GameCard: React.FC<GameCardProps> = ({ genres, title, avatar_url, id,favorites, created_at, desc, ratings }) => {

    const router = useRouter();
    const user = useUser();

    // Sprawdź, czy gra jest nowa (created_at < 6 miesięcy)
    const isNewGame = (new Date().getTime() - new Date(created_at).getTime()) < 2 * 30 * 24 * 60 * 60 * 1000;
    const [expanded, setExpanded] = useState(false);
    const [gameImage, setGameImage] = useState<string | undefined>(undefined);


    const isFavorite = favorites && favorites.some(favorite => favorite.game_id === id && favorite.profile_id === user?.id); // Sprawdzamy, czy gra jest ulubioną grą użytkownika

    //ratings w array of numbers
    const ratingsArray = ratings?.map(rating => rating.rating);
    const addedRatings = ratingsArray?.reduce((a, b) => a + b, 0);
    const averageRating = ratingsArray && ratingsArray.length > 0 ? (addedRatings / ratingsArray.length).toFixed(0) : 0; // Oblicz średnią ocen, jeśli ratingsArray istnieje i ma długość większą od zera

    //genres w array of strings

    const genresArray = genres?.map(genre => genre.genres.name);

    // console.log('genres:', genresArray);


    //downolad image from supabase storage
     const downloadImage = async (path: any) => {
         try {
             const {data, error} = await supabase.storage.from('games').download(path);
             if (error) {
                 throw error;
             }
             const url = URL.createObjectURL(data);
             return url;
         } catch (error) {
             console.log('Error downloading image: ', error);
         }
     }



    useEffect(() => {
        if (avatar_url) {
            downloadImage(avatar_url).then((url) => {
                setGameImage(url)
            }
            );
        }
    }, []);
    

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };


    const handleFavoriteClick = async () => {
        try {

            if(!user) {
                // Użytkownik nie jest zalogowany
                toast.error('You must be logged in to add games to favorites.');
                return;
            }

            if (isFavorite) {
                // Usuń grę z ulubionych
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('game_id', id)
                    .eq('profile_id', user?.id);
            } else {
                // Dodaj grę do ulubionych
                await supabase
                    .from('favorites')
                    .insert([{ game_id: id, profile_id: user?.id }]);
            }




            // Wyświetl komunikat sukcesu
            toast.success(`Game ${title} has been ${isFavorite ? 'removed from' : 'added to'} favorites!`);
        } catch (error) {
            console.error('Error handling favorite click:', error);
            toast.error('An error occurred while processing your request. Please try again later.');
        }
    };

    return (
        <Badge overlap="rectangular" badgeContent={averageRating} color="primary" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Card sx={{
                height: '100%',
                display: 'flex',
                width: '200px',
                flexDirection: 'column',
            }}>
                <CardActionArea onClick={() => router.push(`/game/${id}`)}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        badgeContent="New!"
                        color={"primary"}
                        invisible={!isNewGame}
                    >
                        <CardMedia
                            component="img"
                             image={gameImage}
                             // image={"https://placehold.co/300"} // placeholder_image.jpg to tło zastępcze, które wyświetli się, jeśli obrazek jest niedostępny
                            alt={title}
                            sx={{ height: 200, objectFit: 'cover'}}
                        />
                    </Badge>
                    <CardContent sx={{ flexGrow: 1,
                    }}>
                        <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', maxWidth: "100%" }}>
                            {title}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <IconButton onClick={handleFavoriteClick}>
                        <FavoriteIcon color={isFavorite ? 'primary' : 'action'} />
                    </IconButton>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <Typography paragraph>
                            {desc}
                        </Typography>
                    </CardContent>
                </Collapse>
            </Card>
        </Badge>
    );
};

export default GameCard;
