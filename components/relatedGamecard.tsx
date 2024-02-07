import * as React from 'react';
import {FunctionComponent} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {CardActionArea} from '@mui/material';
import {router} from "next/client";


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


    return (
        <Card sx={{ width: 345, minWidth: 20 }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="140"
                    image={avatar_url}
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