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
import {Login, Logout, Settings} from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import {useDispatch, useSelector} from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';

import SettingsDialog from "./accountDialog"
import {clearUserProfile} from '../redux/userProfileSlice'
import {RootState} from "../redux/types";
import {toggleColorMode} from '../redux/themeSlice';
import MenuIcon from '@mui/icons-material/Menu';
import SearchInput from "./searchInput";

interface ThemeState {
    darkMode: boolean;
}

export default function Navbar() {
    const session = useSession();
    const router = useRouter();
    const user = useUser();
    const isSmallScreen = useMediaQuery("(min-width:900px)");
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

    const navLinks = [
        { text: 'Home', path: '/' },
        { text: 'Top rated games', path: '/games/top-rated' },
        { text: 'Latest games', path: '/games/latest' },
        { text: 'Game finder', path: '/game-finder' },
    ];



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
                sx={{
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                }}
            >
                <Toolbar sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: "flex", gap: 1, cursor: 'pointer' }} onClick={() => router.push('/')}>
                            <Avatar sx={{ height: "2rem", width: "2rem" }} src="/logo.png" />
                            {isSmallScreen && <Typography variant="h6" color="inherit" noWrap>
                                IndiePortal
                            </Typography>}
                        </Box>
                        {isSmallScreen && (
                            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', ml: 2 }}>
                                {navLinks.map((link) => (
                                    <Button
                                        key={link.text}
                                        onClick={() => router.push(link.path)}
                                        sx={{ my: 1, mx: 1.5 }}
                                    >
                                        {link.text}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', marginLeft: 'auto' }}>
                        {isSmallScreen && <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', pr: 2 }}>
                            <SearchInput/>
                        </Box>}
                        {!isSmallScreen && (
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
                                    onClick={handleMenuClick}
                                >
                                    <MenuIcon sx={{ color: 'primary.main' }} />
                                </IconButton>
                                <Menu
                                    id="basic-menu"
                                    anchorEl={menuAnchorEl}
                                    open={openMenu}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',
                                    }}
                                    PaperProps={{
                                        sx: {
                                            border: '1px solid rgba(0, 0, 0, 0.12)',
                                            backgroundColor: (theme) => theme.palette.background.paper,
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        }
                                    }}
                                >
                                    {navLinks.map((link) => (
                                        <MenuItem
                                            key={link.text}
                                            sx={{ borderRadius: '5px', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                                            onClick={() => router.push(link.path).then(handleMenuClose)}
                                        >
                                            {link.text}
                                        </MenuItem>
                                    ))}
                                    <Divider />
                                    {userProfile.role == 'admin' && <MenuItem sx={{ borderRadius: '5px', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }} color="primary" onClick={() => router.push('/admin-dashboard').then(handleMenuClose)}>Admin Dashboard</MenuItem>}
                                </Menu>
                            </Box>
                        )}
                        {!session ? (<Button onClick={() => router.push("/signin")} variant="outlined" sx={{ my: 1, mx: 1.5 }}>
                            {isSmallScreen ? 'Login' : <Login />}
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