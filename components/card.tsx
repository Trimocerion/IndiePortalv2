import React, {useCallback, useEffect, useState} from 'react'
import {Avatar, Badge, Card, IconButton, Skeleton} from '@mui/material';
import {useSession, useSupabaseClient, useUser} from '@supabase/auth-helpers-react'
import EditIcon from '@mui/icons-material/AddAPhoto';

interface Profile {
  url: string,
  onUpload: any,
  username: string,
}

export default function ProfileCard({ url, onUpload, username, }: Profile) {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  const downloadImage = useCallback(async (path: any) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }, [supabase.storage]);

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url, downloadImage])

  async function uploadAvatar(event: any) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const folderPath = `public/${user?.email}/`
      const filePath = `${folderPath}${fileName}`

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

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
    <Card sx={{ display: 'flex', borderRadius: "1rem",  bgcolor: 'background.default',alignItems:"center"}} elevation={0}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <IconButton aria-label="upload picture" component="label" >
            <input hidden accept="image/*" type="file" onChange={uploadAvatar}
              disabled={uploading} />
            <EditIcon sx={{ fill: "#a6a6a6" }} />
          </IconButton>
        }
      >
        {session ? (<Avatar alt="user" sx={{ width: "7rem", height: "7rem", m: 1 }} src={avatarUrl || user?.user_metadata?.avatar_url} />) : (
          <Skeleton animation="pulse" variant="circular" sx={{ width: "7rem", height: "7rem", m: 2 }} />
        )}
      </Badge>
    </Card>
  );
}
