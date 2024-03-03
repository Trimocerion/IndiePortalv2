import * as React from "react";
import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridToolbar,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../utility/supabaseClient";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Game, RootState } from "../redux/types";
import Dialog from "@mui/material/Dialog";
import CustomizedHook from "../components/autocompleteGenres";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import GameAvatar from "../components/gameavatar";

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

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const [editedGame, setEditedGame] = useState({
    id: "",
    title: "",
    description: "",
    genres: [],
    cover_image_url: "",
  });

  const [openAddModal, setOpenAddModal] = useState(false);


  dayjs.extend(utc)
  dayjs.extend(timezone);
  const [gameDate, setGameDate] = useState<Dayjs>(dayjs())


  const [gameGenres, setGameGenres] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string | null>(null);


  const [newGameTitle, setNewGameTitle] = useState("");
  const [gameAvatarUrl, setGameAvatarUrl] = useState<string | any>("");

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setGameDate(date);
    }
  };

  const handleGameGenresChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setGameGenres((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };


// Funkcja do zamykania modala
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    // Fetch games
    const fetchGames = async () => {
      try {
        setIsLoadingGames(true);
        const { data, error } = await supabase
          .from("games")
          .select("*, genres(*), ratings(*), platforms(*), age_ranges(*)");
        if (error) {
          throw error;
        }


        //sum ratings
        data.map((game: any) => {
          let sum = 0;
          game.ratings.map((rating: any) => {
            sum += rating.rating;
          });
          game.rating = sum / game.ratings.length || 0;
          game.rating = game.rating.toFixed(0);
        });

        setGames(data || []);
      } catch (error) {
        toast.error("Error loading games!");
        console.error(error);
      } finally {
        setIsLoadingGames(false);
      }
    };

    // Fetch users
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")

        if (error) {
          throw error;
        }
        console.log(data);

        setUsers(data || []);
      } catch (error) {
        toast.error("Error loading users!");
        console.error(error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchGames();
    fetchUsers();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID",},
    { field: "title", headerName: "Title", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "release_date", headerName: "Release Date", flex: 1 },
    {
      field: "genres",
      headerName: "Genres",
      flex: 1,
      renderCell: (params: any) => (
          <List dense>
            {params.value && params.value.map((genre: any) => (
                <ListItem key={genre.id}>{genre.genre_name}</ListItem>
            ))}
          </List>

      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      headerAlign: "center",
      align: "center",
      flex: 1,
      cellClassName: "actions",
      renderCell: (params: GridRowModel) => (
        <>
          <ButtonGroup
            variant="contained"
            aria-label="Basic button group"
            fullWidth
          >
            <Button
              startIcon={<EditIcon />}
              onClick={() => handleEditMovie(params.row)}
            />
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteMovie(params.id as string)}
            />
          </ButtonGroup>
        </>
      ),
    },
  ];

  const userColumns: any = useMemo(
    () => [
      { field: "username", headerName: "Username", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "description", headerName: "Description", flex: 1 },
      { field: "rank", headerName: "Rank points", flex: 1 },
      { field: "created_at", headerName: "Created at", flex: 1 ,
        renderCell: (params: GridValueGetterParams) => (
            <span>{new Date(params.row.created_at).toLocaleDateString()}</span>
        )

      },
      { field: "updated_at", headerName: "Updated at", flex: 1,
        renderCell: (params: GridValueGetterParams) => (
            <span>{new Date(params.row.updated_at).toLocaleDateString()}</span>
        )
      },
      { field: "role",
        headerName: "Role",
        flex: 1 ,editable: true,
        type: "singleSelect",
        valueOptions: ["user", "admin"],
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        renderCell: (params: GridValueGetterParams) => (
            params.row.id !== user?.id && (

                  <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteUser(params.row.id)}
                  >
                    Delete
                  </Button>
                )
        ),
      },
    ],
    [],
  );

  const handleEditMovie = async (item: any) => {
    //handle edit movie

    setSelectedItem(item);
    console.log("Selected item:", item);
    setOpenModal(true);

    setEditedGame({
      id: item.id,
      title: item.title,
      description: item.description,
      genres: item.genres,
      cover_image_url: item.cover_image_url,
    });
  };

  const handleChangeEditedGame = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setEditedGame((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveEditedGame = async () => {
    try {
      // Sprawdź, czy id, title i description nie są puste
      if (!editedGame.id || !editedGame.title || !editedGame.description) {
        console.error("ID, title, or description is missing.");
        return;
      }

      // Zaktualizuj dane gry w tabeli games
      const updates: {
        id?: any;
        title?: string;
        description?: string;
        cover_image_url?: string;
      } = {
        id: editedGame.id,
        title: editedGame.title,
        description: editedGame.description,
        cover_image_url: editedGame.cover_image_url,
      };

      console.log("Updates:", updates);

      let { data, error } = await supabase.from("games").upsert(updates);
      if (error) {
        throw error;
      }

      // Pobierz gatunki gry z tabeli genres
      let { data: genresData, error: genresError } = await supabase
        .from("genres")
        .select("id, genre_name")
        .in("genre_name", selectedCategory);

      if (genresError) {
        throw genresError;
      }

      // Pobierz istniejące gatunki gry z tabeli game_genres
      let { data: existingGameGenresData, error: existingGameGenresError } =
        await supabase
          .from("game_genres")
          .select("genre_id")
          .eq("game_id", editedGame.id);

      if (existingGameGenresError) {
        throw existingGameGenresError;
      }

      const existingGenreIds = existingGameGenresData?.map(
        (row: any) => row.genre_id,
      );

      console.log("Existing genre IDs:", existingGenreIds);

      let selectedCategoryIds: any;

      if (genresData?.length === 0) {
        console.log("Genres data:", genresData);
        selectedCategoryIds = existingGenreIds;
      } else {
        selectedCategoryIds = genresData?.map((genre: any) => genre.id);
      }

      console.log("Selected category IDs:", selectedCategoryIds);
      console.log("Game genres:", editedGame.genres);

      // Usuń gatunki, które nie są już wybrane przez użytkownika
      const genresToDelete = existingGenreIds?.filter(
        (genreId: any) => !selectedCategoryIds?.includes(genreId),
      );
      const genresToAdd = selectedCategoryIds?.filter(
        (genreId: any) => !existingGenreIds?.includes(genreId),
      );

      console.log("Genres to delete:", genresToDelete);
      console.log("Genres to add:", genresToAdd);

      // @ts-ignore
      for (const genreId of genresToDelete) {
        await supabase
          .from("game_genres")
          .delete()
          .eq("genre_id", genreId)
          .eq("game_id", editedGame.id);
      }

      // Dodaj nowe rekordy do tabeli game_genres dla nowych gatunków gier
      // @ts-ignore
      for (const genre of genresData) {
        // @ts-ignore
        if (!existingGenreIds.includes(genre.id)) {
          await supabase.from("game_genres").insert([
            {
              // @ts-ignore
              game_id: editedGame.id,
              genre_id: genre.id,
            },
          ]);
        }
      }

      //aktualiazacja stanu lokanlego genres w tabeli games

      // Aktualizacja stanu lokalnego po zapisaniu zmian
      const updatedGames = games.map((game) => {
        if (game.id === editedGame.id) {
          return { ...game, ...editedGame ,

            genres: genresData,

          }; // Aktualizacja tylko edytowanej gry
        }
        return game;
      });

      console.log("Updated games:", updatedGames);

      setGames(updatedGames);
      setSelectedCategory([]);
      handleCloseModal();
      console.log("Game updated successfully:", data);
    } catch (error) {
      console.error("Error updating game:", error);
    }
  };

  const handleDeleteMovie = async (gameId: string) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this user?",
      );

      if (confirmed) {
        // Delete the movie from Supabase
        const { data, error } = await supabase
          .from("games")
          .delete()
          .eq("id", gameId);
        if (error) {
          throw error;
        }
      }
      if (!confirmed) {
        return;
      }

      // Update the local state to reflect the changes
      setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
      toast.success("Game deleted successfully!");
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Error deleting game!");
    }
  };
  

  const handleDeleteUser = async (userId: string) => {
    try {
      
        const confirmed = window.confirm(
            "Are you sure you want to delete this user?",
        );


        if (!confirmed) {
            return;
        }
        
      // Delete the user from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) {
        throw error;
      }

      // Update the local state to reflect the changes
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user!");
    }
  };

  const handleChangeTab = (event: SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const [newGame, setNewGame] = useState({
    title: "",
    description: "",
    release_date: new Date().toISOString(),
    cover_image_url: "",
    age_range: 0,
    platform_ids:0
  });

  // Funkcja obsługująca zmiany w polach formularza
  const handleChangeNewGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewGame((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === "title") {
      setNewGameTitle(value);
    }
  };



  // Funkcja obsługująca dodawanie nowej gry
  const handleAddGame = async () => {
    try {

      //dodaj date gry do obiektu
        newGame.release_date = gameDate.toISOString();

        newGame.cover_image_url = gameAvatarUrl;

        console.log("New game:", newGame);





      // Dodaj nową grę do tabeli games w Supabase
      const { data, error } = await supabase.from("games").insert([newGame]).select();
      if (error) {
        throw error;
      }

      const newGameId = data[0].id;


      // Pobierz gatunki gry z tabeli genres
      let { data: genresData2, error: genresError2 } = await supabase
          .from("genres")
          .select("id, genre_name")
          .in("genre_name", gameGenres);

        if (genresError2) {
            throw genresError2;
        }

        console.log("Genres data:", genresData2);



      // @ts-ignore
      for (const genre of genresData2) {
        // @ts-ignore
        await supabase.from("game_genres").insert([
          {
            // @ts-ignore
            game_id: newGameId,
            genre_id: genre.id,
          },
        ]);
      }



    const newGameWithId = {...newGame, id: newGameId};




      // Aktualizuj lokalny stan, aby odzwierciedlić zmiany
      setGames((prevGames) => [...prevGames, newGameWithId]);

      setNewGame({
        title: "",
        description: "",
        release_date: new Date().toISOString(),
        cover_image_url: "",
        age_range: 0,
        platform_ids:0
      });
      setGameAvatarUrl("");
      // Zamknij okno dialogowe po dodaniu gry
      setOpenAddModal(false);
      toast.success("Game added successfully!");
    } catch (error) {
      console.error("Error adding game:", error);
      toast.error("Error adding game!");
    }
  };

  const handleSaveEditedUser = async (updates: any) => {

    try{

      const updated = {
        id: updates.id,
        role: updates.role,
        updated_at: new Date().toISOString()
      }

        // Zaktualizuj dane użytkownika w tabeli profiles
      const { data, error } = await supabase.from("profiles").upsert(updated);

        if (error) {
            throw error;
        }

        // Aktualizacja stanu lokalnego po zapisaniu zmian
        const updatedUsers = users.map((user) => {
            if (user.id === updates.id) {
                return { ...user, ...updated }; // Aktualizacja tylko edytowanego użytkownika
            }
            return user;
        });
        setUsers(updatedUsers);

        

    }
    catch (error) {
      console.error("Error updating user:", error);
    }


  }

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  }

  // @ts-ignore
  return (
    <Box sx={{ width: "100%", px: 2, py: 2 }}>
      <Head>
        <title>Admin Dashboard | IndiePortal</title>
      </Head>

      {/* Przycisk dodania nowej gry */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button onClick={handleOpenAddModal} variant="contained" color="primary">
          Add Game
        </Button>
      </Box>

      <AppBar
        position="static"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth">
          <Tab label="Games" />
          <Tab label="Users" />
        </Tabs>
      </AppBar>

      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        {currentTab === 0 && (
          <DataGrid
            sx={{ borderRadius: "1rem", bgcolor: "background.paper" }}
            getRowHeight={() => "auto"}
            pagination
            disableRowSelectionOnClick
            autoHeight
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

        {currentTab === 1 && (
          <DataGrid
            sx={{ borderRadius: "1rem", bgcolor: "background.paper" }}
            autoHeight
            disableRowSelectionOnClick
            pagination
            isCellEditable={(params) => params.row.id !== user?.id}
            
            rows={users}
            columns={userColumns}
            pageSizeOptions={[5, 10, 25]}
            loading={isLoadingUsers}
            getRowId={(row) => row.id}
            processRowUpdate={(updatedRow, originalRow) => {

              handleSaveEditedUser(updatedRow).then();
            }}
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
      </Paper>

      {/* Karta/modal edycji */}
      <Dialog
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "1rem",
                bgcolor: "background.paper",
              width: "100%",

              height: "50%",
            },
          }}
          open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Edit</DialogTitle>
        <DialogContent>

          <Stack   divider={<Divider orientation="vertical" flexItem />}
          >
                       <GameAvatar url={selectedItem?.cover_image_url}
            onUpload={
                (event: React.SyntheticEvent, url: string) => {
                    setEditedGame((prevState) => ({
                    ...prevState,
                    cover_image_url: url,
                    }));
                }
            }
            gameName={selectedItem?.title}/>
          <TextField
            id="title"
            name="title"
            label="Title"
            variant="filled"
            defaultValue={selectedItem?.title}
            onChange={handleChangeEditedGame}
          />
          <TextField
            id="release_date"
            label="Release date"
            variant="filled"
            name="release_date"
            defaultValue={selectedItem?.release_date}
          />
          <CustomizedHook
            genres={selectedItem?.genres}
            onSelectedGenresChange={(selectedGenres) =>
              setSelectedCategory(selectedGenres)
            }
          />
            <br/>
          <TextField
            id="filled-basic"
            label="Desc"
            variant="filled"
            defaultValue={selectedItem?.description}
            name="description"
            multiline
            onChange={handleChangeEditedGame}
          />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveEditedGame}>Save</Button>
          {/* Dodaj przycisk do zapisywania zmian w danych */}
        </DialogActions>
      </Dialog>

      {/* Karta/modal dodawnia gry */}
      <Dialog
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "1rem",
              bgcolor: "background.paper",
              width: "100%",

              height: "50%",
            },
          }}
          open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle>Add</DialogTitle>
        <DialogContent>




          <Stack   divider={<Divider orientation="vertical" flexItem />}
          >

            <GameAvatar url={gameAvatarUrl}
                        onUpload={(event: React.SyntheticEvent, url: string) => {
                          setGameAvatarUrl(url)
                        }}
                        gameName={newGame.title} />

            <TextField
                id="title"
                name="title"
                label="Title"
                variant="filled"
                value={newGame.title}
                onChange={handleChangeNewGame}
            />
            <br/>


            <DatePicker
                label="Release date"
                value={dayjs(gameDate)}
                onChange={handleDateChange}
                timezone="Europe/Paris"
            />
            <CustomizedHook
                onSelectedGenresChange={(selectedGenres) =>
                    setGameGenres(selectedGenres)
                }
            />
            <br/>
            <TextField
                id="description"
                label="Desc"
                variant="filled"
                value={newGame.description}
                name="description"
                multiline
                onChange={handleChangeNewGame}
            />

            {/* Select grupa wiekowa gry */}
              <InputLabel id="demo-simple-select-label">Age Range</InputLabel>
              <Select
                  labelId="age-range"
                  name="age_range"
                  value={newGame.age_range}
                  label="Age Range"
                  // @ts-ignore
                  onChange={handleChangeNewGame}
              >
                <MenuItem value='1'>
                  3-7
                </MenuItem>
                <MenuItem value='2'>
                  8-12
                </MenuItem>
                <MenuItem value='3'>
                  13-17
                </MenuItem>
                <MenuItem value='4'>
                  18+
                </MenuItem>
              </Select>
            {/* Select platforma gry */}
              <InputLabel id="demo-simple-select-label">Platform</InputLabel>
              <Select
                  labelId="age-range"
                  name="platform_ids"
                  value={newGame.platform_ids}
                  label="Platform"
                  // @ts-ignore
                  onChange={handleChangeNewGame}
              >
                <MenuItem value='1'>
                  PC
                </MenuItem>
                <MenuItem value='2'>
                  Playstation 5
                </MenuItem>
                <MenuItem value='3'>
                  Xbox series X
                </MenuItem>
                <MenuItem value='4'>
                  Nintendo switch
                </MenuItem>
                <MenuItem value='5'>
                  Xbox 360
                </MenuItem>
                <MenuItem value='6'>
                  PlayStation 3
                </MenuItem>
                <MenuItem value='7'>
                  PlayStation 4
                </MenuItem>
                <MenuItem value='8'>
                  Xbox One
                </MenuItem>
                <MenuItem value='9'>
                  Android
                </MenuItem>
                <MenuItem value='10'>
                  IOS
                </MenuItem>
              </Select>


          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Cancel</Button>
          <Button onClick={handleAddGame}>Save</Button>
          {/* Dodaj przycisk do zapisywania zmian w danych */}
        </DialogActions>
      </Dialog>

    </Box>
  );
}
