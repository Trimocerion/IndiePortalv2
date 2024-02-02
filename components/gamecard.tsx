// components/GameCard.tsx
import React from 'react';
import {Badge, Button, Card, CardActions, CardContent, CardMedia, Typography} from '@mui/material';
import {useRouter} from "next/router";


interface GameCardProps {
    title?: string;
    avatar_url?: string;
    desc?: string;
    id?: number;
    genres?: string;
    created_at?: any;
}

const GameCard: React.FC<GameCardProps> = ({ title, avatar_url, id,genres, created_at }) => {

    const router = useRouter();

    // Sprawdź, czy gra jest nowa (created_at < 6 miesięcy)
    const isNewGame = (new Date().getTime() - new Date(created_at).getTime()) < 6 * 30 * 24 * 60 * 60 * 1000;


    return (
        <Card sx={{
            minHeight: '100%',
            backgroundColor: (theme) =>
                theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[900],
            alignItems: 'center',
        }}>
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                badgeContent="New!"
                color={"primary"}
                invisible={!isNewGame}
            >
            <CardMedia
                component="img"
                height="194"
                image={avatar_url}
                alt={title}
                sx={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
                />
            </Badge>
            {/*<CardHeader
                avatar={
                    avatar_url ? (
                        <img src={avatar_url} alt={title} style={{ width: '100%', height: 'auto' }} />
                    ) : (
                        <Skeleton variant="rectangular" width={210} height={118} />
                    )
                }
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{
                    align: 'center',
                }}
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[900],
                    alignItems: 'center',
                }}
            />*/}
            <CardContent>
                <Typography variant="h6" align="center">
                    {title}
                </Typography>
                <Typography variant="body1" align="center">

                    {genres}

                </Typography>
            </CardContent>
            <CardActions>
                <Button fullWidth variant="outlined" onClick={() => router.push(`/game/${id}`)}>
                    Details
                </Button>
            </CardActions>
        </Card>
    );
};

export default GameCard;
