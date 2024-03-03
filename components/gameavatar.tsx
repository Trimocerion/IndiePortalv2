import React, { useEffect, useState } from "react";
import { Avatar, Badge, Card, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/AddAPhoto";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface GameAvatarProps {
  url: string;
  onUpload: any;
  gameName?: string; // Dodaj nową właściwość do przekazywania nazwy gry
}

const GameAvatar: React.FC<GameAvatarProps> = ({ url, onUpload, gameName }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState<boolean>(false);
    const supabase = useSupabaseClient();

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    async function downloadImage(path: any) {
        try {
            const { data, error } = await supabase.storage.from('games').download(path)
            if (error) {
                throw error
            }
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    }

    async function uploadAvatar(event: any) {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }


            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const folderPath = `public/${gameName}/`; // Ustaw folder na podstawie nazwy gry
            const filePath = `${folderPath}${fileName}`

            let { error: uploadError } = await supabase.storage.from('games').upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            onUpload(event, filePath)
        } catch (error) {
            console.log('Error : ', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card sx={{ display: 'flex', borderRadius: '1rem', bgcolor: 'background.default', alignItems: 'center' }} elevation={0}>
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                    <IconButton aria-label="upload picture" component="label">
                        <input hidden accept="image/*" type="file" onChange={uploadAvatar} disabled={uploading} />
                        <EditIcon sx={{ fill: '#a6a6a6' }} />
                    </IconButton>
                }
            >
                <Avatar alt="game" sx={{ width: '7rem', height: '7rem', m: 1 }} src={avatarUrl} />
            </Badge>
        </Card>
    );
};

export default GameAvatar;
