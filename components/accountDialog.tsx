import React, {ReactElement, ReactNode, useEffect, useState} from 'react'
import {useSession, useUser} from '@supabase/auth-helpers-react'
import {Box, Button, DialogActions, Grid, Paper, Skeleton, Tab, Tabs, TextField, Typography} from '@mui/material';
import toast from 'react-hot-toast';
import {useDispatch} from "react-redux";
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

import Profile from "../components/card";
import {setUserProfile} from '../redux/userProfileSlice'
import {supabase} from "../utility/supabaseClient";
import Slide from '@mui/material/Slide';
import {TransitionProps} from '@mui/material/transitions';
import {DatePicker} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";


interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function SettingsDialog(props: SimpleDialogProps) {
    const session = useSession()
    const user = useUser();
    const dispatch = useDispatch();
    const [value, setValue] = useState(0)
    const [loading, setLoading] = useState(true)
    const { onClose, open } = props;
    const isSmallScreen = useMediaQuery("(min-width:500px)");


    const [username, setUsername] = useState<string | any>("")
    const [avatar_url, setAvatarUrl] = useState<string | any>("")
    const [email, setEmail] = useState<string | any>("")
    const [birthday, setBirthday] = useState<Dayjs | null>(null)
    const [description, setDescription] = useState<string | any>("")
    const [role, setRole] = useState<string | any>("")


    dayjs.extend(utc)
    dayjs.extend(timezone);
    const today = dayjs()
    const maxDate = today.subtract(18, 'year').format('YYYY-MM-DD')


    const handleDateChange = (date: any) => {
        setBirthday(date);
    };

    const handleClose = () => {
        onClose()
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        async function getProfile() {
            try {
                setLoading(true)
                if (!user) {
                    return;
                }

                let { data, error, status } = await supabase
                    .from('profiles')
                    .select(`*`)
                    .eq('id', user.id)
                    .single()

                if (error && status !== 406) {
                    throw error
                }

                if (data) {
                    setUsername(data?.username);
                    setEmail(data?.email);
                    setAvatarUrl(data?.avatar_url);
                    setRole(data?.role);
                    setDescription(data?.description);
                    setBirthday(dayjs.utc(data.birthday).local());
                    dispatch(setUserProfile(data))
                }
            } catch (error) {
                toast.error('Error loading user data!');
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        getProfile()
    }, [user, dispatch])




    async function updateProfile({
                                     username,
                                     avatar_url,
                                     description,
                                     birthday
                                 }: {
        username?: string,
        avatar_url?: string,
        description?: string,
        birthday?: any
    }) {
        try {

            setLoading(true)
            if (!user) throw new Error('No user')

            const updates = {
                id: user.id,
                username,
                avatar_url,
                description,
                birthday: birthday ? dayjs.utc(birthday).toISOString() : null,
                updated_at: new Date().toISOString(),
            }
            let { data, error } = await supabase.from('profiles').upsert(updates).select()
            if (error) throw error
            dispatch(setUserProfile(updates))
            toast.success('Profile updated successfully!');
            handleClose()

        } catch (error) {
            toast.error('Error updating the data!');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Dialog
                fullScreen={isSmallScreen ? false : true}
                open={open}
                maxWidth="sm"
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar sx={{position: 'relative'}} color="inherit">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon/>
                        </IconButton>
                        <Box sx={{ml: 2, flex: 1}}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Account" {...a11yProps(0)} />
                                <Tab label="Favorites" {...a11yProps(1)} />
                            </Tabs>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{width: '100%'}}>


                    <TabPanel value={value} index={0}>
                        <Paper sx={{
                            width: '100%',
                            maxWidth: 600,
                            py: 2,
                            px: 1,
                            bgcolor: 'background.default',
                            borderRadius: "1rem"
                        }} elevation={0}>
                                <Grid container rowSpacing={1} columnSpacing={{xs: 2, sm: 3, md: 2}}>
                                    <Grid item xs={12} md={12} justifyContent="center">
                                        <Profile
                                            onUpload={(event: React.SyntheticEvent, url: string) => {
                                                setAvatarUrl(url)
                                                updateProfile({username, avatar_url: url, description})
                                            }}
                                            url={avatar_url}
                                            username={username}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="username"
                                            type="text"
                                            value={username || user?.user_metadata.name}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="email" type="text" value={email}
                                                   disabled/>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="role" type="text" value={role}
                                                   disabled/>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="description"
                                            type="text"
                                            value={description || user?.user_metadata.description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <DatePicker
                                            label="Date of birth"
                                            value={dayjs(birthday)}
                                            onChange={handleDateChange}
                                            disableFuture
                                            timezone="Europe/Paris"
                                            maxDate={dayjs(maxDate)}
                                            minDate={dayjs('1960-01-01')}
                                        />
                                    </Grid>
                                </Grid>
                        </Paper>
                        <DialogActions>
                            <Button onClick={handleClose} variant="outlined" size="small"
                                    fullWidth>Cancel</Button>
                            <Button autoFocus
                                    onClick={() => updateProfile({username, avatar_url, description, birthday})}
                                    disabled={loading}
                                    size="small"
                                    fullWidth
                                    sx={{color: `contrastText`}}
                                    variant="contained">
                                {loading ? 'Loading ...' : 'Save Changes'}</Button>

                        </DialogActions>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                    </TabPanel>
                </Box>
            </Dialog>
        </>
    );
}