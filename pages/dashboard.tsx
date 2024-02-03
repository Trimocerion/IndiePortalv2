/*
import * as React from 'react';
import {SyntheticEvent, useEffect, useMemo, useState} from 'react';
import {DataGrid, GridColDef, GridRowModel, GridToolbar, GridValueGetterParams} from '@mui/x-data-grid';
import {AppBar, Box, Button, List, ListItem, ListItemText, Paper, Skeleton, Tab, Tabs, Typography} from '@mui/material';
import Head from 'next/head';
import {useRouter} from "next/router";
import {useSession, useUser} from '@supabase/auth-helpers-react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsDialog from "../components/accountDialog"
import {supabase} from "../utility/supabaseClient";
import toast from 'react-hot-toast';
import {useSelector} from "react-redux";
import {RootState} from "../redux/types";

interface Props {
    window?: () => Window;
}

export default function AdminDashboard(props: Props) {
    const [games, setGames] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const session = useSession();
    const user = useUser();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const userProfile = useSelector((state: RootState) => state.userProfile);
    const [currentTab, setCurrentTab] = React.useState(0);



    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        // Fetch games
        const fetchGames = async () => {
            try {
                setIsLoadingGames(true);
                const { data, error } = await supabase.from('games').select('*');
                if (error) {
                    throw error;
                }
                setGames(data || []);
            } catch (error) {
                toast.error('Error loading movies!');
                console.error(error);
            } finally {
                setIsLoadingGames(false);
            }
        };

        // Fetch users
        const fetchUsers = async () => {
            try {
                setIsLoadingUsers(true);
                const { data, error } = await supabase.from('profiles').select('*');
                if (error) {
                    throw error;
                }
                console.log(data)
                setUsers(data || []);
            } catch (error) {
                toast.error('Error loading users!');
                console.error(error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchGames();
        fetchUsers();
    }, []);

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'title', headerName: 'Title', editable: true, flex: 1 },
        { field: 'release_date', headerName: 'Release Date', flex: 1, editable: true},
        { field: 'genres', headerName: 'Genres', flex: 1, editable: true},
        { field: 'rating', headerName: 'Rating', flex: 1, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            flex: 1,
            cellClassName: 'actions',
            renderCell: (params: GridRowModel) => (
                <>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditMovie(params.id as string)}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteMovie(params.id as string)}
                    />
                </>
            ),
        },
    ];

    const userColumns: any = useMemo(
        () => [
            { field: 'username', headerName: 'Username', flex: 1 },
            { field: 'email', headerName: 'Email', flex: 1 },
            {
                field: 'edit',
                headerName: 'Edit',
                flex: 1,
                renderCell: (params: GridValueGetterParams) => (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditUser(params.row.id)}
                    >
                        Edit
                    </Button>
                ),
            },
            {
                field: 'delete',
                headerName: 'Delete',
                flex: 1,
                renderCell: (params: GridValueGetterParams) => (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteUser(params.row.id)}
                    >
                        Delete
                    </Button>
                ),
            },
        ],
        []
    );

    const handleEditMovie = async (movieId: string) => {
        //handle edit movie
    };

    const handleDeleteMovie = async (gameId: string) => {
        try {
            // Delete the movie from Supabase
            const { data, error } = await supabase.from('games').delete().eq('id', gameId);
            if (error) {
                throw error;
            }

            // Update the local state to reflect the changes
            setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
            toast.success('Game deleted successfully!');
        } catch (error) {
            console.error('Error deleting movie:', error);
            toast.error('Error deleting game!');
        }
    };

    const handleEditUser = async (userId: string) => {
       //handle edit user

    };

    const handleDeleteUser = async (userId: string) => {
        try {
            // Delete the user from Supabase
            const { data, error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) {
                throw error;
            }

            // Update the local state to reflect the changes
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error deleting user!');
        }
    };

    const handleChangeTab = (event: SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%', px: 2, py: 2 }}>
            <Head>
                <title>Admin Dashboard | IndiePortal</title>
            </Head>
            <SettingsDialog
                open={open}
                onClose={handleClose}
            />
            <List sx={{ width: '100%', borderRadius: "1rem", borderColor: "#333333", mb: 1, bgcolor: 'background.paper' }}>
                <ListItem alignItems="flex-start" secondaryAction={<>
                    {session?.user?.email &&
                        <Button onClick={handleClickOpen} variant="outlined" size="small" startIcon={<EditIcon />} sx={{ borderRadius: "0.4rem" }}>
                            Edit
                        </Button>
                    }
                </>
                }>
                    <ListItemText
                        primary={
                            <>
                                <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                >
                                    {session?.user?.email || <Skeleton width="60%" />}
                                </Typography>
                            </>
                        }
                    />
                </ListItem>
            </List>

            <AppBar position="static" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth">
                    <Tab label="Games" />
                    <Tab label="Users" />
                </Tabs>
            </AppBar>

            <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                {currentTab === 0 && (
                    <DataGrid
                        sx={{ borderRadius: "1rem", bgcolor: 'background.paper' }}
                        autoHeight
                        pagination
                        rows={games}
                        columns={columns}
                        pageSizeOptions={[5, 10, 25]}
                        loading={isLoadingGames}
                        getRowId={(row: any) => row.id}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                            },
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10, page: 0 },
                            },
                        }}
                    />
                )}

              {/!*  {currentTab === 1 && (
                    <DataGrid
                        sx={{ borderRadius: "1rem", bgcolor: 'background.paper' }}
                        autoHeight
                        disableRowSelectionOnClick
                        pagination
                        rows={users}
                        columns={userColumns}
                        pageSizeOptions={[5, 10, 25]}
                        loading={isLoadingUsers}
                        getRowId={(row) => row.id}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 500 },
                            },
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10, page: 0 },
                            },
                        }}
                    />
                )}*!/}
            </Paper>
        </Box>
    );
}
*/
