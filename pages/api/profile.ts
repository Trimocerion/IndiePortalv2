/* eslint-disable import/no-anonymous-default-export */
import {NextApiRequest, NextApiResponse} from "next";
import {supabase} from "../../utility/supabaseClient";
import {useUser} from '@supabase/auth-helpers-react'

type Profile = {
  username: string;
  avatar_url: string;
  email: string;
  role:string
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const user  = useUser();
  try {
    // Pobierz profil uzytkownika z bazy danych
    let { data, error, status } = await supabase
      .from("profiles")
      .select(`*`)
      .eq("id", user?.id)
      .single();
    // Zwroc dane
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching Profile data." });
  }
};
