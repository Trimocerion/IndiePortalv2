import * as React from 'react';
import {Card, List, ListItem, ListItemButton, } from "@mui/material";
import {AspectRatio} from "@mui/icons-material";
import {ListDivider, ListItemContent, Typography} from "@mui/joy";


const data = [
    {
        src: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236',
        title: 'Night view',
        description: '4.21M views',
    },
    {
        src: 'https://images.unsplash.com/photo-1527549993586-dff825b37782',
        title: 'Lake view',
        description: '4.74M views',
    },
    {
        src: 'https://images.unsplash.com/photo-1532614338840-ab30cf10ed36',
        title: 'Mountain view',
        description: '3.98M views',
    },
];

export default function ListStackRatio() {
    return (
        <Card variant="outlined" sx={{ width: 300, p: 0 }}>
            <List sx={{ py: 'var(--ListDivider-gap)' }}>
                {data.map((item, index) => (
                    <React.Fragment key={item.title}>
                        <ListItem>
                            <ListItemButton sx={{ gap: 2 }}>
                                <AspectRatio sx={{ flexBasis: 120 }}>
                                    <img
                                        srcSet={`${item.src}?w=120&fit=crop&auto=format&dpr=2 2x`}
                                        src={`${item.src}?w=120&fit=crop&auto=format`}
                                        alt={item.title}
                                    />
                                </AspectRatio>
                                <ListItemContent>
                                    <Typography fontWeight="md">{item.title}</Typography>
                                    <Typography level="body-sm">{item.description}</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>
                        {index !== data.length - 1 && <ListDivider />}
                    </React.Fragment>
                ))}
            </List>
        </Card>
    );
}
