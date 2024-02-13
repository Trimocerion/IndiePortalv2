import * as React from 'react';
import {SyntheticEvent, useEffect, useMemo, useState} from 'react';
import {DataGrid, GridColDef, GridRowModel, GridToolbar, GridValueGetterParams} from '@mui/x-data-grid';
import {
    AppBar,
    Box,
    Button,
    ButtonGroup,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    Paper,
    Tab,
    Tabs,
    TextField
} from '@mui/material';
import Head from 'next/head';
import {useRouter} from "next/router";
import {useSession, useUser} from '@supabase/auth-helpers-react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {supabase} from "../utility/supabaseClient";
import toast from 'react-hot-toast';
import {useSelector} from "react-redux";
import {Game, RootState} from "../redux/types";
import Dialog from "@mui/material/Dialog";
import CustomizedHook from "../components/autocompleteGenres";


interface Props {
    window?: () => Window;
}

export default function AdminDashboard(props: Props) {
    const [games, setGames] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const session = useSession();
    const user = useUser();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const userProfile = useSelector((state: RootState) => state.userProfile);
    const [currentTab, setCurrentTab] = React.useState(0);


    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Game | null>(null);


    const [editedGame, setEditedGame] = useState({
        id: "",
        title: "",
        description: "",
    });


    // Funkcja do zamykania modala
    const handleCloseModal = () => {
        setOpenModal(false);
    };



    useEffect(() => {
        // Fetch games
        const fetchGames = async () => {
            try {
                setIsLoadingGames(true);
                const {data, error} = await supabase.from('games').select('*, genres(*), ratings(*)');
                if (error) {
                    throw error;
                }

                //sum ratings
                data.map((game: any) => {
                    let sum = 0;
                    game.ratings.map((rating: any) => {
                        sum += rating.rating;
                    });
                    game.rating = sum / game.ratings.length;
                });


                setGames(data || []);
            } catch (error) {
                toast.error('Error loading games!');
                console.error(error);
            } finally {
                setIsLoadingGames(false);
            }
        };

        // Fetch users
        const fetchUsers = async () => {
            try {
                setIsLoadingUsers(true);
                const {data, error} = await supabase.from('profiles').select('*');
                if (error) {
                    throw error;
                }
                console.log(data);

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
        {field: 'id', headerName: 'ID'},
        {field: 'title', headerName: 'Title', flex: 1},
        {field: 'description', headerName: 'Description', flex: 1},
        {field: 'release_date', headerName: 'Release Date', flex: 1},
        {
            field: 'genres',
            headerName: 'Genres',
            flex: 1,
            renderCell: (params: any) => (
                <List dense>
                    {params.value.map((genre: any) => (
                        <ListItem key={genre.id}>
                            {genre.genre_name}
                        </ListItem>
                    ))}
                </List>
            ),
        },
        {
            field: 'rating',
            headerName: 'Rating',
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            renderCell: (params: GridRowModel) => (
                <>
                    <ButtonGroup variant="contained" aria-label="Basic button group" fullWidth>
                        <Button
                            startIcon={<EditIcon/>}
                            onClick={() => handleEditMovie(params.row)}
                        />
                        <Button
                            startIcon={<DeleteIcon/>}
                            onClick={() => handleDeleteMovie(params.id as string)}
                        />
                    </ButtonGroup>
                </>
            ),
        },
    ];


    const userColumns: any = useMemo(
        () => [
            {field: 'username', headerName: 'Username', flex: 1},
            {field: 'email', headerName: 'Email', flex: 1},
            {field: 'description', headerName: 'Description', flex: 1},
            {field: 'rank', headerName: 'Rank points', flex: 1},
            {field: 'favorites', headerName: 'Favorites', flex: 1},
            {field: 'created_at', headerName: 'Created at', flex: 1},
            {field: 'updated_at', headerName: 'Updated at', flex: 1},
            {field: 'role', headerName: 'Role', flex: 1},
            {
                field: 'edit',
                headerName: 'Edit',
                flex: 1,
                renderCell: (params: GridValueGetterParams) => (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon/>}
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
                        startIcon={<DeleteIcon/>}
                        onClick={() => handleDeleteUser(params.row.id)}
                    >
                        Delete
                    </Button>
                ),
            },
        ],
        []
    );

    const handleEditMovie = async (item: any) => {
        //handle edit movie

        setSelectedItem(item);
        console.log('Selected item:', item);
        setOpenModal(true);

        setEditedGame({
            id: item.id,
            title: item.title,
            description: item.description,
        })


    };

    const handleChangeEditedGame = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        console.log('Name:', name);
        console.log('Value:', value);
        setEditedGame(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveEditedGame = async () => {
        try {
            // Sprawdź, czy id, title i description nie są puste
            if (!editedGame.id || !editedGame.title || !editedGame.description) {
                console.error('ID, title, or description is missing.');
                return;
            }

            const updates: {
                id?: any,
                title?: string,
                description?: string
            } = {
                id: editedGame.id,
                title: editedGame.title,
                description: editedGame.description
            }

            console.log('Updates:', updates)

            let {data, error} = await supabase.from('games').upsert(updates);
            if (error) {
                throw error;
            }

            // Aktualizacja stanu lokalnego po zapisaniu zmian
            const updatedGames = games.map(game => {
                if (game.id === editedGame.id) {
                    return { ...game, ...editedGame }; // Aktualizacja tylko edytowanej gry
                }
                return game;
            });
            setGames(updatedGames);
            handleCloseModal();
            console.log('Game updated successfully:', data);
        } catch (error) {
            console.error('Error updating game:', error);
        }
    };

    const handleDeleteMovie = async (gameId: string) => {
        try {

            const confirmed = window.confirm("Are you sure you want to delete this user?");

            if (confirmed) {
                // Delete the movie from Supabase
                const {data, error} = await supabase.from('games').delete().eq('id', gameId);
                if (error) {
                    throw error;
                }
            }
            if (!confirmed) {
                return;
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
            const {data, error} = await supabase.from('profiles').delete().eq('id', userId);
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

    const [newGame, setNewGame] = useState({
        title: "",
        description: "",
        release_date: "",
        genres: "",
    });

    // Funkcja obsługująca zmiany w polach formularza
    const handleChangeNewGame = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setNewGame(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Funkcja obsługująca dodawanie nowej gry
    const handleAddGame = async () => {

        try {
            // Dodaj nową grę do tabeli games w Supabase
            const {data, error} = await supabase.from('games').insert([newGame]);
            if (error) {
                throw error;
            }
            // Aktualizuj lokalny stan, aby odzwierciedlić zmiany
            setGames(prevGames => [...prevGames, newGame]);
            // Zamknij okno dialogowe po dodaniu gry
            setOpenModal(false);
            toast.success('Game added successfully!');
        } catch (error) {
            console.error('Error adding game:', error);
            toast.error('Error adding game!');
        }
    };


    return (
        <Box sx={{width: '100%', px: 2, py: 2}}>
            <Head>
                <title>Admin Dashboard | IndiePortal</title>
            </Head>

            {/* Przycisk dodania nowej gry */}
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
                <Button onClick={handleAddGame} variant="contained" color="primary">
                    Add Game
                </Button>
            </Box>

            <AppBar position="static" sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth">
                    <Tab label="Games"/>
                    <Tab label="Users"/>
                </Tabs>
            </AppBar>

            <Paper elevation={3} sx={{p: 2, mt: 2}}>
                {currentTab === 0 && (
                    <DataGrid
                        sx={{borderRadius: "1rem", bgcolor: 'background.paper'}}
                        getRowHeight={() => 'auto'}
                        pagination
                        disableRowSelectionOnClick
                        autoHeight
                        rows={games}
                        columns={columns}
                        pageSizeOptions={[5, 10, 25]}
                        loading={isLoadingGames}
                        getRowId={(row: any) => row.id}
                        slots={{toolbar: GridToolbar}}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: {debounceMs: 500},
                            },
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: {pageSize: 10, page: 0},
                            },
                        }}
                    />
                )}

                {currentTab === 1 && (
                    <DataGrid
                        sx={{borderRadius: "1rem", bgcolor: 'background.paper'}}
                        autoHeight
                        disableRowSelectionOnClick
                        pagination
                        rows={users}
                        columns={userColumns}
                        pageSizeOptions={[5, 10, 25]}
                        loading={isLoadingUsers}
                        getRowId={(row) => row.id}
                        slots={{toolbar: GridToolbar}}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: {debounceMs: 500},
                            },
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: {pageSize: 10, page: 0},
                            },
                        }}
                    />
                )}
            </Paper>

            {/* Karta/modal */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Edit</DialogTitle>
                <DialogContent>
                    {/* Tutaj dodaj komponent karty/modala z danymi wybranej gry lub użytkownika */}
                    {/* Możesz przekazać dane selectedItem do komponentu karty/modala */}

                    <TextField id="title"
                               name="title"
                               label="Title"
                               variant="filled"
                               defaultValue={selectedItem?.title}
                               onChange={handleChangeEditedGame}
                    />
                    <TextField id="release_date"
                               label="Release date"
                               variant="filled"
                                 name="release_date"
                               defaultValue={selectedItem?.release_date}/>
                    <CustomizedHook
                        genres={selectedItem?.genres}
                    />

                    <TextField id="filled-basic"
                               label="Desc"
                               variant="filled"
                               defaultValue={selectedItem?.description}
                                name="description"
                               onChange={handleChangeEditedGame}
                    />


                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSaveEditedGame}>Save</Button>
                    {/* Dodaj przycisk do zapisywania zmian w danych */}
                </DialogActions>
            </Dialog>
        </Box>
    );
}

