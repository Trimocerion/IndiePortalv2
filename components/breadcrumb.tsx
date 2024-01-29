import * as React from 'react';
import { useRouter } from 'next/router';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(5),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(3),
    };
}) as typeof Chip;

export default function CustomizedBreadcrumbs() {
    const router = useRouter();

    const handleClick = (event: React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();
        console.info('You clicked a breadcrumb.');

        // Użyj router.back(), aby cofnąć się o jeden krok
        router.back();
    };

    return (
        <>
            <StyledBreadcrumb
                component="a"
                label="Home"
                onClick={handleClick}
                icon={<HomeIcon fontSize="small" />}
            />
        </>
    );
}
