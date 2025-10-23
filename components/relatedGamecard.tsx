import * as React from "react";
import { FunctionComponent, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { supabase } from "../utility/supabaseClient";

interface RelatedGameCardProps {
  title?: string;
  avatar_url?: string;
  desc?: string;
  id?: number;
}

const RelatedGamecard: FunctionComponent<RelatedGameCardProps> = ({ title, avatar_url }) => {
    const [gameImage, setGameImage] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        if (avatar_url) {
            downloadImage(avatar_url);
        }
    }, [avatar_url]);

    async function downloadImage(path: any) {
        try {
            const { data, error } = await supabase.storage.from('games').download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setGameImage(url);
        } catch (error) {
            console.log('Error downloading image: ', error);
        }
    }

    return (
        <Card sx={{ maxWidth: 345, m: 'auto' }}>
            <CardMedia
                component="img"
                height="140"
                image={gameImage}
                alt={title}
            />
            <CardContent>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default RelatedGamecard;
