import * as React from 'react';
import {ChangeEvent, useEffect, useState} from 'react';
import {useRouter} from "next/router";
import {useSession, useSupabaseClient, useUser} from '@supabase/auth-helpers-react'
import {
    AppBar,
    Avatar,
    Box,
    Button,
    CssBaseline,
    Divider,
    GlobalStyles,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem, MenuList,
    Switch,
    Toolbar,
    Tooltip,
    Typography
} from '@mui/material';
import {Logout, Settings} from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import {useDispatch, useSelector} from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';

import SettingsDialog from "./accountDialog"
import {clearUserProfile} from '../redux/userProfileSlice'
import {RootState} from "../redux/types";
import {toggleColorMode} from '../redux/themeSlice';
import MenuIcon from '@mui/icons-material/Menu';

interface ThemeState {
    darkMode: boolean;
}

export default function Navbar() {
    const session = useSession();
    const router = useRouter();
    const user = useUser();
    const isSmallScreen = useMediaQuery("(min-width:500px)");
    const supabaseClient = useSupabaseClient()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const userProfile = useSelector((state: RootState) => state.userProfile);
    const [openDialog, setOpenDialog] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("")



    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClickClose = () => {
        setOpenDialog(false);
    };

    const isDarkMode = useSelector((state: ThemeState) => state.darkMode);
    const [checked, setChecked] = useState(true);

    const handleDarkModeToggle = (event: ChangeEvent<HTMLInputElement>) => {
        setChecked((event.target.checked));
        dispatch(toggleColorMode());
    };
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        router.push(`/signin`)
        supabaseClient.auth.signOut()
        dispatch(clearUserProfile())
    };


    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(menuAnchorEl);

    // Funkcja otwierająca menu
    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

// Funkcja zamykająca menu
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };



    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                if (userProfile?.avatar_url) {
                    const { data, error } = await supabaseClient.storage
                        .from('avatars')
                        .download(userProfile.avatar_url);

                    if (error) {
                        console.error('Error downloading avatar:', error.message);
                        return;
                    }

                    const avatarUrl = URL.createObjectURL(data);
                    setAvatarUrl(avatarUrl);
                }
            } catch (error :any) {
                console.error('Error fetching avatar:', error.message);
            }
    };

            fetchAvatar();
        }, [userProfile.avatar_url] );






    return (
        <>
            <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
            <CssBaseline />
            <AppBar
                position="sticky"
                color="inherit"
                elevation={0}
                sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
            >
                <Toolbar sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
                        <Avatar sx={{ height: "2rem", width: "2rem" }} src="/logo.png" />
                        {isSmallScreen && <Typography variant="h6" color="inherit" noWrap >
                            IndiePortal
                        </Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>



                            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="open menu"
                                    aria-controls={openMenu ? 'basic-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={openMenu ? 'true' : undefined}
                                    sx={{ mr: 2 }}
                                    onClick={handleMenuClick} // Dodajemy obsługę kliknięcia na przycisk
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={menuAnchorEl}
                                    open={openMenu}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    <MenuItem onClick={() => router.push('/').then(handleMenuClose)}>Home</MenuItem>
                                    <MenuItem onClick={() => router.push('/games/top-rated').then(handleMenuClose)}>Top rated games</MenuItem>
                                    <MenuItem onClick={() => router.push('/games/latest').then(handleMenuClose)}>latest games</MenuItem>
                                    <MenuItem divider onClick={() => router.push('/game-finder').then(handleMenuClose)}>Game finder</MenuItem>
                                    {userProfile.role == 'admin' && <MenuItem color="primary" onClick={() => router.push('/admin-dashboard').then(handleMenuClose)}>Admin Dashboard</MenuItem>}
                                </Menu>
                            </Box>


                        {!session ? (<Button onClick={() => router.push("/signin")} variant="outlined" sx={{ my: 1, mx: 1.5 }}>
                            Login
                        </Button>) : (
                            <Tooltip title="Account settings">
                                <IconButton
                                    onClick={handleClick}
                                    size="small"
                                    sx={{ ml: 2 }}
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    <Avatar src={avatarUrl || userProfile.avatar_url} sx={{ width: 32, height: 32 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar src={avatarUrl || userProfile.avatar_url} />
                                </ListItemAvatar>
                                <ListItemText primary={userProfile.username} />
                            </ListItem>
                        </List>
                        <Divider />
                        <MenuItem >
                            <ListItemIcon>
                                <Brightness4Icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText> Dark mode</ListItemText>
                            <Switch
                                size="small"
                                edge="end"
                                checked={checked} onChange={handleDarkModeToggle}
                                inputProps={{
                                    'aria-labelledby': 'switch-list-label-bluetooth',
                                }}
                            />
                        </MenuItem>
                        <MenuItem onClick={handleClickOpen}>
                            <ListItemIcon>
                                <Settings fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <SettingsDialog
                open={openDialog}
                onClose={handleClickClose}
            />
        </>
    );
}