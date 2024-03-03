import * as React from "react";
import { FunctionComponent, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { supabase } from "../utility/supabaseClient";

interface RelatedGameCardProps {
  title?: string;
  avatar_url?: string;
  desc?: string;
  id?: number;
  genres?: string;
  created_at?: any;
}



const RelatedGamecard:FunctionComponent<RelatedGameCardProps> = ( {title, avatar_url, id, genres}) =>  {


    const genresArray = genres?.split(',');

    //pobierz avatary gier
    const [gameImage, setGameImage] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        if (avatar_url) downloadImage(avatar_url);
    }, [avatar_url]);


    async function downloadImage(path: any) {
        try {
            const { data, error } = await supabase.storage.from('games').download(path)
            if (error) {
                throw error
            }
            const url = URL.createObjectURL(data)
            setGameImage(url)
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    }


    return (
        <Card sx={{ width: 345, minWidth: 20 }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="140"
                    image={gameImage}
                    alt={title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default RelatedGamecard;